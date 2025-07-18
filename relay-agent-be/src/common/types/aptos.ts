import { Network } from '@aptos-labs/ts-sdk';

// Aptos Network Configuration
export interface AptosNetworkConfig {
  network: Network;
  nodeUrl: string;
  faucetUrl?: string;
}
