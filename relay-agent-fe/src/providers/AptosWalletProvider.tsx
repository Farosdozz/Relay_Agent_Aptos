'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  AptosWalletContextType,
  SupportedWalletName,
  AptosErrorCode,
  AptosError,
  WalletInfo,
} from '../types/aptos';
import { aptosConfig, WALLET_DOWNLOAD_URLS } from '../config/aptos.config';

// Wallet detection and interaction utilities
interface WalletAdapter {
  name: SupportedWalletName;
  icon: string;
  downloadUrl: string;
  isInstalled: () => boolean;
  connect: () => Promise<{ address: string; publicKey: string }>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<{ signature: string }>;
  signTransaction: (transaction: any) => Promise<{ signature: string }>;
  onAccountChange?: (callback: (account: any) => void) => void;
  onNetworkChange?: (callback: (network: any) => void) => void;
}

// Wallet adapters for different wallet types
const createWalletAdapters = (): WalletAdapter[] => {
  return [
    {
      name: 'Petra',
      icon: '/icons/wallets/petra.svg',
      downloadUrl: WALLET_DOWNLOAD_URLS.Petra,
      isInstalled: () =>
        typeof window !== 'undefined' && 'aptos' in window && !!(window as any).aptos?.petra,
      connect: async () => {
        const petra = (window as any).aptos?.petra;
        if (!petra) throw new Error('Petra wallet not found');

        const response = await petra.connect();
        return {
          address: response.address,
          publicKey: response.publicKey,
        };
      },
      disconnect: async () => {
        const petra = (window as any).aptos?.petra;
        if (petra?.disconnect) {
          await petra.disconnect();
        }
      },
      signMessage: async (message: string) => {
        const petra = (window as any).aptos?.petra;
        if (!petra) throw new Error('Petra wallet not found');

        const response = await petra.signMessage({
          message,
          nonce: Math.random().toString(),
        });
        return { signature: response.signature };
      },
      signTransaction: async (transaction: any) => {
        const petra = (window as any).aptos?.petra;
        if (!petra) throw new Error('Petra wallet not found');

        const response = await petra.signTransaction(transaction);
        return { signature: response.signature };
      },
      onAccountChange: (callback: (account: any) => void) => {
        const petra = (window as any).aptos?.petra;
        if (petra?.onAccountChange) {
          petra.onAccountChange(callback);
        }
      },
      onNetworkChange: (callback: (network: any) => void) => {
        const petra = (window as any).aptos?.petra;
        if (petra?.onNetworkChange) {
          petra.onNetworkChange(callback);
        }
      },
    },
    {
      name: 'Martian',
      icon: '/icons/wallets/martian.svg',
      downloadUrl: WALLET_DOWNLOAD_URLS.Martian,
      isInstalled: () => typeof window !== 'undefined' && 'martian' in window,
      connect: async () => {
        const martian = (window as any).martian;
        if (!martian) throw new Error('Martian wallet not found');

        const response = await martian.connect();
        return {
          address: response.address,
          publicKey: response.publicKey,
        };
      },
      disconnect: async () => {
        const martian = (window as any).martian;
        if (martian?.disconnect) {
          await martian.disconnect();
        }
      },
      signMessage: async (message: string) => {
        const martian = (window as any).martian;
        if (!martian) throw new Error('Martian wallet not found');

        const response = await martian.signMessage(message);
        return { signature: response.signature };
      },
      signTransaction: async (transaction: any) => {
        const martian = (window as any).martian;
        if (!martian) throw new Error('Martian wallet not found');

        const response = await martian.signTransaction(transaction);
        return { signature: response.signature };
      },
    },
    {
      name: 'Pontem',
      icon: '/icons/wallets/pontem.svg',
      downloadUrl: WALLET_DOWNLOAD_URLS.Pontem,
      isInstalled: () => typeof window !== 'undefined' && 'pontem' in window,
      connect: async () => {
        const pontem = (window as any).pontem;
        if (!pontem) throw new Error('Pontem wallet not found');

        const response = await pontem.connect();
        return {
          address: response.address,
          publicKey: response.publicKey,
        };
      },
      disconnect: async () => {
        const pontem = (window as any).pontem;
        if (pontem?.disconnect) {
          await pontem.disconnect();
        }
      },
      signMessage: async (message: string) => {
        const pontem = (window as any).pontem;
        if (!pontem) throw new Error('Pontem wallet not found');

        const response = await pontem.signMessage({ message });
        return { signature: response.signature };
      },
      signTransaction: async (transaction: any) => {
        const pontem = (window as any).pontem;
        if (!pontem) throw new Error('Pontem wallet not found');

        const response = await pontem.signTransaction(transaction);
        return { signature: response.signature };
      },
    },
    {
      name: 'Rise',
      icon: '/icons/wallets/rise.svg',
      downloadUrl: WALLET_DOWNLOAD_URLS.Rise,
      isInstalled: () => typeof window !== 'undefined' && 'rise' in window,
      connect: async () => {
        const rise = (window as any).rise;
        if (!rise) throw new Error('Rise wallet not found');

        const response = await rise.connect();
        return {
          address: response.address,
          publicKey: response.publicKey,
        };
      },
      disconnect: async () => {
        const rise = (window as any).rise;
        if (rise?.disconnect) {
          await rise.disconnect();
        }
      },
      signMessage: async (message: string) => {
        const rise = (window as any).rise;
        if (!rise) throw new Error('Rise wallet not found');

        const response = await rise.signMessage({ message });
        return { signature: response.signature };
      },
      signTransaction: async (transaction: any) => {
        const rise = (window as any).rise;
        if (!rise) throw new Error('Rise wallet not found');

        const response = await rise.signTransaction(transaction);
        return { signature: response.signature };
      },
    },
  ];
};

// Context
const AptosWalletContext = createContext<AptosWalletContextType | null>(null);

// Provider Props
interface AptosWalletProviderProps {
  children: ReactNode;
}

// Provider Component
const OldAptosWalletProvider: React.FC<AptosWalletProviderProps> = ({ children }) => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [account, setAccount] = useState<{ address: string; publicKey: string } | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Initialize wallets on mount
  useEffect(() => {
    const initializeWallets = () => {
      const adapters = createWalletAdapters();
      const walletInfos: WalletInfo[] = adapters.map((adapter) => ({
        name: adapter.name,
        icon: adapter.icon,
        url: adapter.downloadUrl,
        installed: adapter.isInstalled(),
      }));

      setWallets(walletInfos);
    };

    // Wait for window to be available
    if (typeof window !== 'undefined') {
      // Small delay to ensure wallet extensions are loaded
      setTimeout(initializeWallets, 100);
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!aptosConfig.wallets.autoConnect) return;

      const savedWalletName = localStorage.getItem('aptos-wallet-name');
      if (savedWalletName) {
        try {
          await connect(savedWalletName as SupportedWalletName);
        } catch (error) {
          console.warn('Auto-connect failed:', error);
          localStorage.removeItem('aptos-wallet-name');
        }
      }
    };

    autoConnect();
  }, []);

  // Connect to wallet
  const connect = useCallback(
    async (walletName: string) => {
      if (connecting) return;

      setConnecting(true);

      try {
        const adapters = createWalletAdapters();
        const adapter = adapters.find((a) => a.name === walletName);

        if (!adapter) {
          throw createAptosError(
            AptosErrorCode.WALLET_NOT_INSTALLED,
            `Wallet ${walletName} not supported`,
          );
        }

        if (!adapter.isInstalled()) {
          throw createAptosError(
            AptosErrorCode.WALLET_NOT_INSTALLED,
            `${walletName} wallet is not installed`,
          );
        }

        const accountInfo = await adapter.connect();

        const walletInfo: WalletInfo = {
          name: adapter.name,
          icon: adapter.icon,
          url: adapter.downloadUrl,
          installed: true,
          address: accountInfo.address,
          chainId: 1, // Default chainId for Aptos network
        };

        setWallet(walletInfo);
        setAccount(accountInfo);
        setConnected(true);

        // Save wallet preference
        localStorage.setItem('aptos-wallet-name', walletName);

        // Set up event listeners
        if (adapter.onAccountChange) {
          adapter.onAccountChange((newAccount) => {
            if (newAccount) {
              setAccount({
                address: newAccount.address,
                publicKey: newAccount.publicKey,
              });
            } else {
              disconnect();
            }
          });
        }

        if (adapter.onNetworkChange) {
          adapter.onNetworkChange((network) => {
            console.log('Network changed:', network);
            // Handle network change if needed
          });
        }
      } catch (error) {
        console.error('Wallet connection failed:', error);

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            throw createAptosError(
              AptosErrorCode.USER_REJECTED,
              'User rejected the connection request',
            );
          }
          if (error.message.includes('timeout')) {
            throw createAptosError(
              AptosErrorCode.CONNECTION_TIMEOUT,
              'Connection request timed out',
            );
          }
        }

        throw error;
      } finally {
        setConnecting(false);
      }
    },
    [connecting],
  );

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    if (disconnecting) return;

    setDisconnecting(true);

    try {
      if (wallet) {
        const adapters = createWalletAdapters();
        const adapter = adapters.find((a) => a.name === wallet.name);

        if (adapter) {
          await adapter.disconnect();
        }
      }

      setWallet(null);
      setAccount(null);
      setConnected(false);

      // Clear saved wallet preference
      localStorage.removeItem('aptos-wallet-name');
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    } finally {
      setDisconnecting(false);
    }
  }, [wallet, disconnecting]);

  // Sign message
  const signMessage = useCallback(
    async (message: string): Promise<{ signature: string }> => {
      if (!wallet || !connected) {
        throw createAptosError(AptosErrorCode.WALLET_NOT_CONNECTED, 'Wallet not connected');
      }

      try {
        const adapters = createWalletAdapters();
        const adapter = adapters.find((a) => a.name === wallet.name);

        if (!adapter) {
          throw createAptosError(AptosErrorCode.WALLET_NOT_CONNECTED, 'Wallet adapter not found');
        }

        return await adapter.signMessage(message);
      } catch (error) {
        console.error('Message signing failed:', error);

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            throw createAptosError(
              AptosErrorCode.USER_REJECTED,
              'User rejected the signing request',
            );
          }
        }

        throw error;
      }
    },
    [wallet, connected],
  );

  // Sign transaction
  const signTransaction = useCallback(
    async (transaction: any): Promise<{ signature: string }> => {
      if (!wallet || !connected) {
        throw createAptosError(AptosErrorCode.WALLET_NOT_CONNECTED, 'Wallet not connected');
      }

      try {
        const adapters = createWalletAdapters();
        const adapter = adapters.find((a) => a.name === wallet.name);

        if (!adapter) {
          throw createAptosError(AptosErrorCode.WALLET_NOT_CONNECTED, 'Wallet adapter not found');
        }

        return await adapter.signTransaction(transaction);
      } catch (error) {
        console.error('Transaction signing failed:', error);

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            throw createAptosError(AptosErrorCode.USER_REJECTED, 'User rejected the transaction');
          }
          if (error.message.includes('Insufficient funds')) {
            throw createAptosError(
              AptosErrorCode.INSUFFICIENT_FUNDS,
              'Insufficient funds for transaction',
            );
          }
        }

        throw error;
      }
    },
    [wallet, connected],
  );

  const contextValue: AptosWalletContextType = {
    wallets,
    wallet,
    account,
    connected,
    connecting,
    disconnecting,
    connect,
    disconnect,
    signMessage,
    signTransaction,
  };

  return <AptosWalletContext.Provider value={contextValue}>{children}</AptosWalletContext.Provider>;
};

// Utility function to create Aptos errors
function createAptosError(code: AptosErrorCode, message: string, details?: any): AptosError {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
  };
}

// Export the context for advanced usage
export { AptosWalletContext };
