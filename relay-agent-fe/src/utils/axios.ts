import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import * as Sentry from '@sentry/nextjs';
import { AptosErrorCode, AptosError } from '@/types/aptos';

export const request = axios.create({
  baseURL: 'https://api.openai.com/v1',
  timeout: 15 * 60 * 1000,
});

request.interceptors.request.use(async (config) => {
  return config;
});

request.interceptors.response.use((response) => {
  return response.data;
});

// Define a custom interface for requests with retry flag
interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'aptos_access_token';
const REFRESH_TOKEN_KEY = 'aptos_refresh_token';

// Create Aptos error helper
const createAptosError = (code: AptosErrorCode, message: string, details?: any): AptosError => {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
};

// Token refresh function
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw createAptosError(
          AptosErrorCode.INVALID_SIGNATURE,
          'No refresh token available'
        );
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BE_API_URL || 'http://localhost:3001'}/auth/aptos/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );

      const { accessToken, expiresIn } = response.data;

      // Update stored tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      const expiryTime = Date.now() + (expiresIn * 1000);
      localStorage.setItem('aptos_token_expiry', expiryTime.toString());

      return accessToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      // Clear auth data on refresh failure
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('aptos_user_data');
      localStorage.removeItem('aptos_token_expiry');

      // Dispatch custom event to notify auth hook
      window.dispatchEvent(new CustomEvent('aptos-auth-expired'));

      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const apiBackend: AxiosInstance = axios.create({
  // baseURL: 'https://dev.api.relay-agent.io',
  baseURL: process.env.NEXT_PUBLIC_BE_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication and debugging
apiBackend.interceptors.request.use(
  (config) => {
    // Add access token to requests if available
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken && !config.headers?.Authorization) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Log request details for debugging (excluding sensitive auth endpoints)
    const isAuthEndpoint = config.url?.includes('/auth/');
    if (!isAuthEndpoint && process.env.NODE_ENV === 'development') {
      const hasAuthHeader = !!config.headers?.Authorization;
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url} (Auth: ${hasAuthHeader})`);
    }

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    Sentry.captureException(error);
    return Promise.reject(error);
  },
);

// Add response interceptor for token refresh and error handling
apiBackend.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      const isAuthEndpoint = response.config.url?.includes('/auth/');
      if (!isAuthEndpoint) {
        console.log(`API Response: ${response.status} ${response.config.url}`);
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    // Enhanced error logging
    console.error('API Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized with automatic token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't retry auth endpoints to prevent infinite loops
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          // Update the original request with new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request
          return apiBackend(originalRequest);
        } else {
          // Refresh failed, redirect to login or handle appropriately
          throw createAptosError(
            AptosErrorCode.EXPIRED_NONCE,
            'Session expired. Please log in again.'
          );
        }
      } catch (refreshError) {
        console.error('Token refresh failed during request retry:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    // Handle specific Aptos-related errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      let aptosError: AptosError;

      switch (status) {
        case 400:
          if (data?.code === 'INVALID_SIGNATURE') {
            aptosError = createAptosError(
              AptosErrorCode.INVALID_SIGNATURE,
              data.message || 'Invalid signature provided',
              data
            );
          } else if (data?.code === 'INVALID_ADDRESS') {
            aptosError = createAptosError(
              AptosErrorCode.INVALID_ADDRESS,
              data.message || 'Invalid wallet address',
              data
            );
          } else {
            aptosError = createAptosError(
              AptosErrorCode.NETWORK_ERROR,
              data.message || 'Bad request',
              data
            );
          }
          break;

        case 401:
          if (data?.code === 'EXPIRED_NONCE') {
            aptosError = createAptosError(
              AptosErrorCode.EXPIRED_NONCE,
              data.message || 'Authentication nonce expired',
              data
            );
          } else {
            aptosError = createAptosError(
              AptosErrorCode.INVALID_SIGNATURE,
              data.message || 'Authentication failed',
              data
            );
          }
          break;

        case 429:
          aptosError = createAptosError(
            AptosErrorCode.RATE_LIMITED,
            data.message || 'Too many requests. Please try again later.',
            data
          );
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          aptosError = createAptosError(
            AptosErrorCode.NETWORK_ERROR,
            'Server error. Please try again later.',
            data
          );
          break;

        default:
          aptosError = createAptosError(
            AptosErrorCode.NETWORK_ERROR,
            data.message || 'An unexpected error occurred',
            data
          );
      }

      // Capture error in Sentry with additional context
      Sentry.captureException(error, {
        tags: {
          errorType: 'aptos_api_error',
          aptosErrorCode: aptosError.code,
        },
        extra: {
          aptosError,
          originalError: error,
        },
      });

      return Promise.reject(aptosError);
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      const timeoutError = createAptosError(
        AptosErrorCode.CONNECTION_TIMEOUT,
        'Request timeout. Please check your connection and try again.',
        error
      );
      Sentry.captureException(timeoutError);
      return Promise.reject(timeoutError);
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      const networkError = createAptosError(
        AptosErrorCode.NETWORK_ERROR,
        'Network error. Please check your connection.',
        error
      );
      Sentry.captureException(networkError);
      return Promise.reject(networkError);
    }

    // Capture any other errors
    Sentry.captureException(error);
    return Promise.reject(error);
  },
);

// Helper function to set auth token (for backward compatibility)
export const setAuthToken = (token: string | null): void => {
  if (token) {
    apiBackend.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    delete apiBackend.defaults.headers.common['Authorization'];
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

// Helper function to get current auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Helper function to clear all auth data
export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('aptos_user_data');
  localStorage.removeItem('aptos_token_expiry');
  delete apiBackend.defaults.headers.common['Authorization'];
};

// Helper function to check if user is authenticated (synchronous)
export const isUserAuthenticated = (): boolean => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const expiry = localStorage.getItem('aptos_token_expiry');
  
  if (!token || !expiry) return false;
  
  const expiryTime = parseInt(expiry);
  const isValid = Date.now() < expiryTime;
  
  // Ensure axios headers are set if token is valid
  if (isValid && token) {
    apiBackend.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return isValid;
};
