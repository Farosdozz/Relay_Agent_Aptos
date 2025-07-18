import { apiBackend } from '@/utils/axios';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { useAptosAuth } from './useAptosAuth';

interface UseAuthTokenReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  refreshToken: () => Promise<string | null>;
}

/**
 * Custom hook for managing Aptos auth token and authentication state
 */
export function useAuthToken(): UseAuthTokenReturn {
  const { connected, account } = useWallet();
  const { isAuthenticated, user, refreshToken: aptosRefreshToken } = useAptosAuth();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('aptos_access_token');
    if (storedToken) {
      setToken(storedToken);
      apiBackend.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    // Step 1: Check if we can get access token
    if (!isAuthenticated) {
      console.log('useAuthToken: Cannot refresh token - not authenticated');
      return null;
    }
    try {
      setIsLoading(true);
      
      // Try to get the token from localStorage first
      const storedToken = localStorage.getItem('aptos_access_token');
      if (storedToken) {
        setToken(storedToken);
        apiBackend.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        return storedToken;
      }

      // If no stored token, try to refresh
      const newToken = await aptosRefreshToken();
      if (newToken) {
        setToken(newToken);
        apiBackend.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        return newToken;
      }

      console.warn('useAuthToken: No token available after refresh attempt');
      return null;
    } catch (error) {
      console.error('useAuthToken: Failed to refresh token:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, aptosRefreshToken]);

  // Update token when auth state changes
  useEffect(() => {
    if (isAuthenticated && user && connected) {
      // Only refresh if we don't already have a token
      if (!token) {
        refreshToken();
      }
    } else if (!isAuthenticated) {
      setToken(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, connected, token]);

  // Listen for storage changes to sync token across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aptos_access_token' && e.newValue) {
        setToken(e.newValue);
        apiBackend.defaults.headers.common['Authorization'] = `Bearer ${e.newValue}`;
      }
    };

    // Listen for auth success event for immediate updates
    const handleAuthSuccess = (e: CustomEvent) => {
      if (e.detail?.accessToken) {
        setToken(e.detail.accessToken);
        apiBackend.defaults.headers.common['Authorization'] = `Bearer ${e.detail.accessToken}`;
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('aptos-auth-success' as any, handleAuthSuccess);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('aptos-auth-success' as any, handleAuthSuccess);
    };
  }, []);

  return {
    isAuthenticated: isAuthenticated && connected,
    isLoading: isLoading || (isAuthenticated && !token && connected),
    token,
    refreshToken,
  };
}
