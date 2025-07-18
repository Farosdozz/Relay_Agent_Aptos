import { useCallback, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosSignInInput, AptosSignInOutput } from '@aptos-labs/siwa';
import axios from 'axios';
import { apiBackend } from '@/utils/axios';

interface UseAptosConnectAuthReturn {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isSigningIn: boolean;
  error: string | null;
  userEmail: string | null;
}

export const useAptosConnectAuth = (): UseAptosConnectAuthReturn => {
  const wallet = useWallet();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    try {
      setIsSigningIn(true);
      setError(null);

      // Check if wallet supports SIWA
      if (!wallet.signIn) {
        throw new Error('Wallet does not support Sign in with Aptos');
      }

      // Step 1: Get pre-signing input from backend
      const { data: preSigningData } = await axios.get('/api/auth/aptos/pre-sign', {
        params: {
          address: wallet.account?.address?.toString(),
        },
      });

      // Step 2: Create SIWA input with email resource
      const signInInput: AptosSignInInput = {
        nonce: preSigningData.nonce,
        domain: preSigningData.domain,
        statement: preSigningData.statement || 'Sign in to Relay Agent',
        uri: window.location.origin,
        chainId: "mainnet", // Mainnet
        resources: ['aptosconnect.app.email'], // Request email access
      };

      // Step 3: Sign in with wallet (this will show AptosConnect popup if using Google/Apple)
      if (!wallet.account || !wallet.wallet) {
        throw new Error('No wallet connected');
      }
      
      const signInOutput = await wallet.signIn({
        walletName: wallet.wallet.name,
        input: signInInput
      });

      if (!signInOutput) {
        throw new Error('Sign in failed - no output received');
      }

      // Step 4: Extract email from resources if available
      const emailResource = (signInOutput as AptosSignInOutput).input.resources?.find(
        (resource) => resource.startsWith('aptosconnect.app.email')
      );
      
      const email = emailResource?.split(':')[1];
      if (email) {
        setUserEmail(email);
      }

      // Step 5: Verify signature on backend and get auth token
      const { data: authData } = await axios.post('/api/auth/aptos/verify', {
        signInOutput,
        email,
      });

      // Step 6: Store auth token
      localStorage.setItem('aptos_access_token', authData.token);
      apiBackend.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;

      // Step 7: Store user info if needed
      if (authData.user) {
        localStorage.setItem('aptos-user', JSON.stringify({
          address: authData.user.address,
          email: authData.user.email,
          createdAt: authData.user.createdAt,
        }));
      }

    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsSigningIn(false);
    }
  }, [wallet]);

  const signOut = useCallback(async () => {
    try {
      // Clear auth token
      localStorage.removeItem('aptos_access_token');
      localStorage.removeItem('aptos_refresh_token');
      delete apiBackend.defaults.headers.common['Authorization'];
      
      // Clear stored user info
      localStorage.removeItem('aptos-user');
      setUserEmail(null);
      
      // Disconnect wallet
      wallet.disconnect();
      
      // Optional: Call backend logout endpoint
      try {
        await axios.post('/api/auth/logout');
      } catch (err) {
        console.warn('Backend logout failed:', err);
      }
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message || 'Failed to sign out');
    }
  }, [wallet]);

  return {
    signIn,
    signOut,
    isSigningIn,
    error,
    userEmail,
  };
};