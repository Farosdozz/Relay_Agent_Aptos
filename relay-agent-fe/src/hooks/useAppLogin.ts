import { useAptosAuth } from '@/hooks/useAptosAuth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const useAppLogin = () => {
  const { connected } = useWallet();
  const { login: authLogin, isAuthenticated, isLoading: authLoading } = useAptosAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [hasJustConnected, setHasJustConnected] = useState(false);

  const handleLogin = useCallback(() => {
    if (isAuthenticated) {
      // Already authenticated, go to app
      router.push('/app');
      return;
    }

    // Always show connect modal for new standard flow
    setShowConnectModal(true);
    setIsLoggingIn(true);
  }, [isAuthenticated, router]);

  // Track wallet connection changes
  useEffect(() => {
    if (connected && showConnectModal) {
      setHasJustConnected(true);
      setShowConnectModal(false);
    }
  }, [connected, showConnectModal, isLoggingIn]);

  // Handle wallet connection -> authentication flow
  useEffect(() => {
    const performAuthentication = async () => {
      // Check if wallet just connected and we need to authenticate
      if (connected && hasJustConnected && !isAuthenticated && !authLoading) {
        setHasJustConnected(false);
        
        // Add a delay to ensure wallet state is fully propagated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          await authLogin();
          // Navigation will be handled by the success effect
        } catch (error: any) {
          console.error('[useAppLogin] Authentication failed after wallet connection:', error);
          toast.error(error.message || 'Authentication failed. Please try again.');
          setIsLoggingIn(false);
        }
      }
    };

    performAuthentication();
  }, [connected, hasJustConnected, isAuthenticated, authLogin, authLoading]);

  // Handle successful authentication -> redirect to app
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/app');
      setIsLoggingIn(false);
    }
  }, [isAuthenticated, router]);

  // Handle modal close without connecting
  const handleModalClose = useCallback(() => {
    setShowConnectModal(false);
    if (!connected) {
      setIsLoggingIn(false);
    }
  }, [connected]);

  // Callback for when wallet connects from modal
  const handleWalletConnected = useCallback(() => {
    setShowConnectModal(false);
    
    // Set a flag to trigger authentication once wallet state updates
    setHasJustConnected(true);
  }, []);

  return {
    login: handleLogin,
    isLoading: isLoggingIn || authLoading,
    showConnectModal,
    setShowConnectModal: handleModalClose,
    onWalletConnected: handleWalletConnected,
  };
};

export default useAppLogin;
