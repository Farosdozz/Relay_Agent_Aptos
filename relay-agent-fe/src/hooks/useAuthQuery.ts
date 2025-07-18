import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';
import { setAuthToken } from '@/utils/axios';
import { useAuthToken } from './useAuthToken';
import { AxiosError } from 'axios';
import { useAptosAuth } from './useAptosAuth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Type for the query function that will be wrapped with auth
type QueryFn<TData = unknown> = () => Promise<TData>;

// Type for the mutation function that will be wrapped with auth
type MutationFn<TData = unknown, TVariables = unknown> = (variables: TVariables) => Promise<TData>;

/**
 * Custom hook for authenticated queries that automatically handles auth token
 */
export function useAuthQuery<TData = unknown, TError = AxiosError>(
  queryKey: QueryKey,
  queryFn: QueryFn<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) {
  const { connected } = useWallet();
  const { isAuthenticated, isLoading: isAuthLoading } = useAptosAuth();
  const { token, refreshToken, isLoading: isTokenLoading } = useAuthToken();

  return useQuery<TData, TError>({
    queryKey,
    queryFn: async () => {
      try {
        // Get the current token or try to refresh
        let authToken = token;
        
        if (!authToken) {
          // Try to get token from localStorage first
          authToken = localStorage.getItem('aptos_access_token');
          if (authToken) {
            setAuthToken(authToken);
          } else {
            // If still no token, try to refresh
            const newToken = await refreshToken();
            if (!newToken) {
              throw new Error('No authentication token available');
            }
            authToken = newToken;
          }
        } else {
          // Ensure the token is in header
          setAuthToken(authToken);
        }

        return queryFn();
      } catch (error) {
        console.error('Error in authenticated query:', error);
        throw error;
      }
    },
    enabled: connected && isAuthenticated && !isTokenLoading && !isAuthLoading && (!!options?.enabled !== false),
    retry: 3,
    retryDelay: 1000,
    ...options,
  });
}

/**
 * Custom hook for authenticated mutations that automatically handles auth token
 */
export function useAuthMutation<TData = unknown, TVariables = unknown, TError = AxiosError>(
  mutationFn: MutationFn<TData, TVariables>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  const { token, refreshToken } = useAuthToken();

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      try {
        // Get the current token or try to get from localStorage
        let authToken = token || localStorage.getItem('aptos_access_token');
        
        if (authToken) {
          setAuthToken(authToken);
        } else {
          // If still no token, try to refresh
          const newToken = await refreshToken();
          if (!newToken) {
            // Last resort: check localStorage one more time
            authToken = localStorage.getItem('aptos_access_token');
            if (!authToken) {
              throw new Error('No authentication token available');
            }
            setAuthToken(authToken);
          }
        }

        return mutationFn(variables);
      } catch (error) {
        console.error('Error in authenticated mutation:', error);
        throw error;
      }
    },
    ...options,
  });
}
