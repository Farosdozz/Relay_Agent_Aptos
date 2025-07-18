import { Network } from '@aptos-labs/ts-sdk';
import { AptosNetworkConfig, SupportedWalletName } from '../types/aptos';

export interface AptosConfig {
  network: AptosNetworkConfig;
  authentication: {
    messageDomain: string;
    messageStatement: string;
  };
  wallets: {
    supportedWallets: SupportedWalletName[];
    autoConnect: boolean;
  };
  features: {
    enableTestnet: boolean;
    debugMode: boolean;
  };
}

export const getAptosConfig = (): AptosConfig => {
  const networkName = process.env.NEXT_PUBLIC_APTOS_NETWORK || 'mainnet';
  let network: Network;

  switch (networkName.toLowerCase()) {
    case 'mainnet':
      network = Network.MAINNET;
      break;
    case 'testnet':
      network = Network.TESTNET;
      break;
    case 'devnet':
      network = Network.DEVNET;
      break;
    case 'local':
      network = Network.LOCAL;
      break;
    default:
      network = Network.MAINNET;
  }

  return {
    network: {
      network,
      nodeUrl: process.env.NEXT_PUBLIC_APTOS_NODE_URL || 'https://fullnode.mainnet.aptoslabs.com/v1',
      faucetUrl: process.env.NEXT_PUBLIC_APTOS_FAUCET_URL,
    },
    authentication: {
      messageDomain: process.env.NEXT_PUBLIC_APTOS_MESSAGE_DOMAIN || 'relay-agent.io',
      messageStatement: process.env.NEXT_PUBLIC_APTOS_MESSAGE_STATEMENT || 'Sign in to Relay Agent to access DeFi services on Aptos',
    },
    wallets: {
      supportedWallets: ['Petra', 'Martian', 'Pontem', 'Rise'],
      autoConnect: true,
    },
    features: {
      enableTestnet: process.env.NEXT_PUBLIC_ENABLE_APTOS_TESTNET === 'true',
      debugMode: process.env.NEXT_PUBLIC_DEBUG_APTOS === 'true',
    },
  };
};

export const aptosConfig = getAptosConfig();

// Wallet installation URLs
export const WALLET_DOWNLOAD_URLS = {
  Petra: 'https://petra.app/',
  Martian: 'https://martianwallet.xyz/',
  Pontem: 'https://pontem.network/pontem-wallet',
  Rise: 'https://risewallet.io/',
  Nightly: 'https://nightly.app/',
  Fewcha: 'https://fewcha.app/',
  Spika: 'https://spika.app/',
  Bitkeep: 'https://bitkeep.com/',
  TokenPocket: 'https://tokenpocket.pro/',
} as const;
