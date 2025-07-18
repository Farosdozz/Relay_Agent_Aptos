'use client';

import React, { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { toast } from 'react-toastify';

interface AptosConnectProviderProps {
  children: ReactNode;
}

export const AptosConnectProvider: React.FC<AptosConnectProviderProps> = ({ children }) => {
  // Get network from environment or default to mainnet
  const network = (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) || Network.MAINNET;
  
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{
        network,
        aptosApiKeys: {
          [network]: process.env.NEXT_PUBLIC_APTOS_API_KEY || '',
        },
      }}
      onError={(error) => {
        toast.error(error?.message || 'Unknown wallet error', {
          position: 'top-right',
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};