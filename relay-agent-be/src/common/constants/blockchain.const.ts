// Aptos blockchain network
export enum BlockchainNetwork {
  APTOS = 'aptos',
}

export enum SupportedChainId {
  AptosMainnet = 1,       // Aptos mainnet
  AptosTestnet = 2,       // Aptos testnet
}

export const APTOS_NATIVE_TOKEN = '0x1::aptos_coin::AptosCoin';

// Aptos DEX modules
export const APTOS_DEX_MODULES = {
  PANCAKESWAP_ROUTER: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::router',
  THALA_ROUTER: '0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool',
  LIQUIDSWAP_ROUTER: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::scripts_v2',
  PONTEM_LIQUIDSWAP: '0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e::scripts',
  AMNIS_ROUTER: '0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::router',
} as const;

// Aptos tokens
export const APTOS_TOKENS: { [tokenName: string]: string } = {
  // Native token
  APT: '0x1::aptos_coin::AptosCoin',
  
  // Stablecoins
  USDC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
  USDT: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
  DAI: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::DAI',
  
  // Wrapped tokens
  WETH: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
  WBTC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WBTC',
  
  // Popular tokens
  CAKE: '0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT',
  THL: '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
  GUI: '0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2::assets_v1::EchoCoin002',
} as const;

// Aptos URLs
export const APTOS_URLS = {
  MAINNET_NODE: 'https://fullnode.mainnet.aptoslabs.com/v1',
  TESTNET_NODE: 'https://fullnode.testnet.aptoslabs.com/v1',
  MAINNET_INDEXER: 'https://api.mainnet.aptoslabs.com/v1/graphql',
  TESTNET_INDEXER: 'https://api.testnet.aptoslabs.com/v1/graphql',
  MAINNET_FAUCET: 'https://faucet.mainnet.aptoslabs.com',
  TESTNET_FAUCET: 'https://faucet.testnet.aptoslabs.com',
  EXPLORER: 'https://explorer.aptoslabs.com',
};

// Aptos liquidity pools
export const APTOS_POOLS = {
  // PancakeSwap pools
  APT_USDC_PANCAKE: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::LPToken<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
  APT_USDT_PANCAKE: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::LPToken<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT>',
  
  // LiquidSwap pools
  APT_USDC_LIQUID: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::pool::APT_USDC',
  APT_USDT_LIQUID: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::pool::APT_USDT',
};


// Re-export Aptos types and functions from chain.ts
export type { AptosChainConfig } from './chain';
export { 
  AptosMainnetConfig,
  AptosTestnetConfig,
  getAptosChainConfig,
  getAptosTokens,
  getAptosModules,
  getAptosConfigByNetwork,
  DEFAULT_APTOS_CHAIN_ID,
  DEFAULT_APTOS_CONFIG
} from './chain';

// Import the function we need
import { getAptosTokens } from './chain';

// Utility functions
export const getTokensByChain = (chainId: number): Record<string, string> => {
  return getAptosTokens(chainId);
};

export const isChainSupported = (chainId: number): boolean => {
  return Object.values(SupportedChainId).includes(chainId);
};
