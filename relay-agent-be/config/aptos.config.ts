import { Network } from '@aptos-labs/ts-sdk';
import { AptosNetworkConfig } from '../src/common/types/aptos';

export interface AptosConfig {
  network: AptosNetworkConfig;
  authentication: {
    nonceTtl: number;
    messageDomain: string;
    messageStatement: string;
  };
  rateLimiting: {
    nonceRateLimit: number;
    verifyRateLimit: number;
    refreshRateLimit: number;
  };
}

export const getAptosConfig = (): AptosConfig => {
  const networkName = process.env.APTOS_NETWORK || 'mainnet';
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
      nodeUrl: process.env.APTOS_NODE_URL || 'https://fullnode.mainnet.aptoslabs.com/v1',
      faucetUrl: process.env.APTOS_FAUCET_URL,
    },
    authentication: {
      nonceTtl: parseInt(process.env.APTOS_NONCE_TTL || '300', 10), // 5 minutes
      messageDomain: process.env.APTOS_MESSAGE_DOMAIN || 'relay-agent.io',
      messageStatement: process.env.APTOS_MESSAGE_STATEMENT || 'Sign in to Relay Agent to access DeFi services on Aptos',
    },
    rateLimiting: {
      nonceRateLimit: parseInt(process.env.APTOS_NONCE_RATE_LIMIT || '10', 10),
      verifyRateLimit: parseInt(process.env.APTOS_VERIFY_RATE_LIMIT || '5', 10),
      refreshRateLimit: parseInt(process.env.APTOS_REFRESH_RATE_LIMIT || '20', 10),
    },
  };
};

export const aptosConfig = getAptosConfig();
