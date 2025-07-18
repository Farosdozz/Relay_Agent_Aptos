import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { apiBackend } from '@/utils/axios';

interface EmbeddedWallet {
  address: string;
  network: string;
  createdAt: string;
}

// All Aptos wallets are browser extension wallets
export const useEmbeddedWallet = () => {
  const { account } = useWallet();
  const [embeddedWallet, setEmbeddedWallet] = useState<EmbeddedWallet | null>(null);

  useEffect(() => {
    const fetchEmbeddedWallet = async () => {
      if (!account?.address) {
        setEmbeddedWallet(null);
        return;
      }

      try {
        const response = await apiBackend.get('/user/embedded-wallet', {
          params: {
            walletAddress: account.address
          }
        });

        if (response.data.hasEmbeddedWallet) {
          setEmbeddedWallet({
            address: response.data.walletAddress,
            network: response.data.network,
            createdAt: response.data.createdAt
          });
        } else {
          setEmbeddedWallet(null);
        }
      } catch (error) {
        console.error('Error fetching embedded wallet:', error);
        setEmbeddedWallet(null);
      }
    };

    fetchEmbeddedWallet();
  }, [account?.address]);

  return embeddedWallet;
};

export const useNonEmbeddedWallets = () => {
  const { wallets } = useWallet();
  return wallets;
};

// Export the new Aptos authentication hook
export { default as useAptosAuth } from './useAptosAuth';


