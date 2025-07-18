'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiBackend, setAuthToken } from '@/utils/axios';
import { aptosConfig } from '@/config/aptos.config';
import {
  UseAptosAuthReturn,
  AuthUser,
  AptosNonceResponse,
  AptosVerifyRequest,
  AptosAuthResponse,
  RefreshTokenResponse,
  AptosErrorCode,
  AptosError,
} from '@/types/aptos';
import {
  createSignInMessage
} from '@aptos-labs/siwa';
import type { AptosSignInInput } from '@aptos-labs/wallet-standard';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Token storage keys
const ACCESS_TOKEN_KEY = 'aptos_access_token';
const REFRESH_TOKEN_KEY = 'aptos_refresh_token';
const USER_DATA_KEY = 'aptos_user_data';
const TOKEN_EXPIRY_KEY = 'aptos_token_expiry';

// Token refresh buffer (refresh 2 minutes before expiry)
const REFRESH_BUFFER_MS = 2 * 60 * 1000;

export const useAptosAuth = (): UseAptosAuthReturn => {
  const { wallet, account, connected, signMessage } = useWallet();
  
  // Initialize auth state from localStorage to prevent race conditions
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return !!(token && expiry && parseInt(expiry) > Date.now());
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  });
  const [error, setError] = useState<string | null>(null);

  // Refs to prevent multiple simultaneous operations
  const isRefreshingRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // We'll initialize auth state after all functions are defined

  // Clear authentication data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);

    setIsAuthenticated(false);
    setUser(null);
    setError(null);

    // Clear any scheduled refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  // Forward declaration for refreshToken
  const refreshTokenRef = useRef<() => Promise<string | null>>();

  // Schedule automatic token refresh
  const scheduleTokenRefresh = useCallback((expiresInMs: number) => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule refresh before expiry
    const refreshTime = Math.max(expiresInMs - REFRESH_BUFFER_MS, 1000);

    refreshTimeoutRef.current = setTimeout(() => {
      if (refreshTokenRef.current) {
        refreshTokenRef.current();
      }
    }, refreshTime);
  }, []);

  // Store authentication data
  const storeAuthData = useCallback((authResponse: AptosAuthResponse) => {
    const expiryTime = Date.now() + (authResponse.expiresIn * 1000);

    // Store in localStorage first (synchronous)
    localStorage.setItem(ACCESS_TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(authResponse.user));
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

    // Update axios headers immediately
    setAuthToken(authResponse.accessToken);

    // Dispatch custom event to notify other hooks immediately
    window.dispatchEvent(new CustomEvent('aptos-auth-success', {
      detail: {
        accessToken: authResponse.accessToken,
        user: authResponse.user
      }
    }));

    // Update React state
    setUser(authResponse.user);
    setIsAuthenticated(true);

    // Schedule automatic refresh
    scheduleTokenRefresh(authResponse.expiresIn * 1000);
  }, [scheduleTokenRefresh]);

  // Generate SIWA input using official package
  const generateSiwaInput = useCallback((nonce: string, address: string): AptosSignInInput & any => {
    return {
      nonce,
      domain: aptosConfig.authentication.messageDomain,
      statement: aptosConfig.authentication.messageStatement,
      uri: typeof window !== 'undefined' ? window.location.origin : `https://${aptosConfig.authentication.messageDomain}`,
      address,
      chainId: "1", // Aptos mainnet as string
      issuedAt: new Date().toISOString(),
    };
  }, []);

  // Create Aptos error
  const createAptosError = useCallback((code: AptosErrorCode, message: string, details?: any): AptosError => {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Login function
  const login = useCallback(async (): Promise<void> => {
    if (!connected || !account || !wallet) {
      throw createAptosError(
        AptosErrorCode.WALLET_NOT_CONNECTED,
        'Wallet not connected. Please connect your wallet first.'
      );
    }

    if (isLoading) {
      return; // Prevent multiple simultaneous login attempts
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get nonce from backend
      console.log('Step 1: Getting nonce from backend...');
      const nonceResponse = await apiBackend.get<AptosNonceResponse>('/auth/aptos/nonce');
      const { nonce } = nonceResponse.data;
      console.log('Nonce received:', nonce);

      // Step 2: Generate SIWA input using official package
      console.log('Step 2: Generating SIWA input...');
      const siwaInput = generateSiwaInput(nonce, account.address.toString());
      console.log('SIWA input generated:', siwaInput);

      // Step 3: Create SIWA message using official package
      console.log('Step 3: Creating SIWA message...');
      const siwaMessage = createSignInMessage(siwaInput);
      console.log('SIWA message created:', siwaMessage);

      // Step 4: Sign the human-readable message with wallet
      console.log('Step 4: Signing message with wallet...');
      const signMessageInput = {
        message: siwaMessage,
        nonce: nonce
      };
      const signMessageOutput = await signMessage(signMessageInput);
      console.log('Message signed, signature:', signMessageOutput.signature);

      // Step 5: Create serialized SIWA output manually (compatible with backend)
      console.log('Step 5: Creating serialized SIWA output...');

      // Create the serialized output in the format expected by the backend
      const signatureString = signMessageOutput.signature.toString();
      const publicKeyString = account.publicKey.toString();
      const serializedOutput = {
        version: "2",
        type: "ed25519",
        signature: signatureString.startsWith('0x') ? signatureString.slice(2) : signatureString, // Remove 0x prefix if present
        input: siwaInput,
        publicKey: publicKeyString.startsWith('0x') ? publicKeyString.slice(2) : publicKeyString, // Remove 0x prefix if present
      };

      console.log('Serialized output created:', serializedOutput);

      // Step 6: Verify signature with backend
      console.log('Step 6: Verifying signature with backend...');
      const verifyRequest: AptosVerifyRequest = {
        output: serializedOutput,
      };
      console.log('Verify request payload:', verifyRequest);

      const authResponse = await apiBackend.post<AptosAuthResponse>('/auth/aptos/verify', verifyRequest);
      console.log('Authentication successful:', authResponse.data);

      // Step 8: Store authentication data
      storeAuthData(authResponse.data);
      console.log('Authentication successful, token stored');

    } catch (error: any) {
      console.error('Login failed:', error);

      let errorMessage = 'Authentication failed. Please try again.';
      let errorCode = AptosErrorCode.NETWORK_ERROR;

      if (error.response) {
        // Backend error
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorCode = AptosErrorCode.INVALID_SIGNATURE;
            errorMessage = data.message || 'Invalid signature or request format.';
            break;
          case 401:
            errorCode = AptosErrorCode.EXPIRED_NONCE;
            errorMessage = data.message || 'Authentication nonce expired. Please try again.';
            break;
          case 429:
            errorCode = AptosErrorCode.RATE_LIMITED;
            errorMessage = 'Too many authentication attempts. Please wait and try again.';
            break;
          default:
            errorMessage = data.message || 'Server error occurred during authentication.';
        }
      } else if (error.code === AptosErrorCode.USER_REJECTED) {
        errorCode = AptosErrorCode.USER_REJECTED;
        errorMessage = 'User rejected the signing request.';
      } else if (error.message?.includes('timeout')) {
        errorCode = AptosErrorCode.CONNECTION_TIMEOUT;
        errorMessage = 'Connection timeout. Please check your network and try again.';
      }

      const aptosError = createAptosError(errorCode, errorMessage, error);
      setError(aptosError.message);
      throw aptosError;
    } finally {
      setIsLoading(false);
    }
  }, [connected, account, wallet, isLoading, signMessage, generateSiwaInput, storeAuthData, createAptosError]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current) {
      return null; // Prevent multiple simultaneous refresh attempts
    }

    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      clearAuthData();
      return null;
    }

    isRefreshingRef.current = true;

    try {
      const response = await apiBackend.post<RefreshTokenResponse>('/auth/aptos/refresh', {
        refreshToken: storedRefreshToken,
      });

      const { accessToken, expiresIn } = response.data;
      const expiryTime = Date.now() + (expiresIn * 1000);

      // Update stored tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      // Update axios headers immediately
      setAuthToken(accessToken);

      // Schedule next refresh
      scheduleTokenRefresh(expiresIn * 1000);

      return accessToken;
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      // If refresh fails, clear auth data and require re-login
      clearAuthData();

      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [clearAuthData, scheduleTokenRefresh]);

  // Set the ref for refreshToken
  refreshTokenRef.current = refreshToken;

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const userData = localStorage.getItem(USER_DATA_KEY);
        const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

        if (accessToken && userData && tokenExpiry) {
          const expiryTime = parseInt(tokenExpiry, 10);
          const now = Date.now();

          if (now < expiryTime) {
            // Token is still valid
            setUser(JSON.parse(userData));
            setIsAuthenticated(true);
            // Ensure axios has the token
            setAuthToken(accessToken);

            // Set up automatic refresh
            scheduleTokenRefresh(expiryTime - now);
          } else {
            // Token expired, try to refresh
            refreshToken();
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        clearAuthData();
      }
    };

    initializeAuth();
  }, [refreshToken, scheduleTokenRefresh, clearAuthData]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (storedRefreshToken) {
        // Notify backend about logout
        try {
          await apiBackend.post('/auth/aptos/logout', {
            refreshToken: storedRefreshToken,
          });
        } catch (error) {
          // Continue with logout even if backend call fails
          console.warn('Backend logout failed, but continuing with local logout:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth data
      clearAuthData();
      setIsLoading(false);
    }
  }, [clearAuthData]);

  // Listen for auth expiry events from axios interceptor
  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthData();
    };

    window.addEventListener('aptos-auth-expired', handleAuthExpired);

    return () => {
      window.removeEventListener('aptos-auth-expired', handleAuthExpired);
    };
  }, [clearAuthData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Auto-logout when wallet disconnects
  useEffect(() => {
    if (!connected && isAuthenticated) {
      logout();
    }
  }, [connected, isAuthenticated, logout]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshToken,
    error,
  };
};

export default useAptosAuth;
