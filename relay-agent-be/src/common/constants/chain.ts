// Aptos Testnet Configuration
export const AptosTestnetConfig: AptosChainConfig = {
  CHAIN_INFO: {
    NAME: 'Aptos Testnet',
    CHAIN_ID: 2,
    NETWORK: 'testnet',
    NODE_URL: 'https://fullnode.testnet.aptoslabs.com/v1',
    FAUCET_URL: 'https://faucet.testnet.aptoslabs.com',
    INDEXER_URL: 'https://api.testnet.aptoslabs.com/v1/graphql',
    EXPLORER: 'https://explorer.aptoslabs.com/?network=testnet',
  },
  TOKEN: {
    // Native token
    APT: '0x1::aptos_coin::AptosCoin',
    
    // Stablecoins
    USDC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    USDT: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
    
    // Wrapped tokens
    WETH: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
    WBTC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WBTC',
  },
  MODULE: {
    // Core modules
    COIN: '0x1::coin',
    APTOS_ACCOUNT: '0x1::aptos_account',
    
    // DEX modules (example addresses - replace with actual)
    PANCAKESWAP_ROUTER: '0x163ebc6c5e93e5e2e8cf5bbf988c46e2a9ee6f5050365bb442834292cee01b7e::router',
    THALA_ROUTER: '0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool',
    LIQUIDSWAP_ROUTER: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::scripts_v2',
  },
  POOL: {
    // Example liquidity pool addresses
    APT_USDC: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::pool::APT_USDC',
    APT_USDT: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::pool::APT_USDT',
  },
};

// Aptos Mainnet Configuration
export const AptosMainnetConfig: AptosChainConfig = {
  CHAIN_INFO: {
    NAME: 'Aptos Mainnet',
    CHAIN_ID: 1,
    NETWORK: 'mainnet',
    NODE_URL: 'https://fullnode.mainnet.aptoslabs.com/v1',
    FAUCET_URL: 'https://faucet.mainnet.aptoslabs.com',
    INDEXER_URL: 'https://api.mainnet.aptoslabs.com/v1/graphql',
    EXPLORER: 'https://explorer.aptoslabs.com',
  },
  TOKEN: {
    // Native token
    APT: '0x1::aptos_coin::AptosCoin',
    
    // Stablecoins
    USDC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    USDT: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
    DAI: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::DAI',
    
    // Wrapped tokens
    WETH: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH',
    WBTC: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WBTC',
    
    // Other popular tokens
    CAKE: '0x159df6b7689437016108a019fd5bef736bac692b6d4a1f10c941f6fbb9a74ca6::oft::CakeOFT',
    THL: '0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL',
    GUI: '0xe4ccb6d39136469f376242c31b34d10515c8eaaa38092f804db8e08a8f53c5b2::assets_v1::EchoCoin002',
  },
  MODULE: {
    // Core modules
    COIN: '0x1::coin',
    APTOS_ACCOUNT: '0x1::aptos_account',
    APTOS_FRAMEWORK: '0x1::aptos_framework',
    
    // DEX modules
    PANCAKESWAP_ROUTER: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::router',
    THALA_ROUTER: '0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool',
    LIQUIDSWAP_ROUTER: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::scripts_v2',
    PONTEM_LIQUIDSWAP: '0x163df34fccbf003ce219d3f1d9e70d140b60622cb9dd47599c25fb2f797ba6e::scripts',
    AMNIS_ROUTER: '0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::router',
  },
  POOL: {
    // PancakeSwap pools
    APT_USDC_PANCAKE: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::LPToken<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
    APT_USDT_PANCAKE: '0xc7efb4076dbe143cbcd98cfaaa929ecfc8f299203dfff63b95ccb6bfe19850fa::swap::LPToken<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT>',
    
    // LiquidSwap pools
    APT_USDC_LIQUID: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::pool::APT_USDC',
    APT_USDT_LIQUID: '0x5e156f1207d0ebfa19a9eeff00d62a282278fb8719f4fab3a586a0a2c0fffbea::pool::APT_USDT',
  },
};

// Aptos chain configuration interface
export interface AptosChainConfig {
  CHAIN_INFO: {
    NAME: string;
    CHAIN_ID: number;
    NETWORK: string;
    NODE_URL: string;
    FAUCET_URL: string;
    INDEXER_URL: string;
    EXPLORER: string;
  };
  TOKEN: {
    [tokenName: string]: string; // Aptos uses string addresses like "0x1::aptos_coin::AptosCoin"
  };
  MODULE: {
    [moduleName: string]: string; // Module addresses
  };
  POOL: {
    [poolName: string]: string; // Liquidity pool addresses
  };
}

// Aptos chain configuration mapping
export const AptosChainConfigs = {
  1: AptosMainnetConfig,
  2: AptosTestnetConfig,
} as const;

// Utility function to get Aptos chain configuration
export function getAptosChainConfig(chainId: number): AptosChainConfig | null {
  if (chainId in AptosChainConfigs) {
    return AptosChainConfigs[chainId as keyof typeof AptosChainConfigs];
  }
  return null;
}

// Utility function to get tokens for Aptos chain
export function getAptosTokens(chainId: number): Record<string, string> {
  const config = getAptosChainConfig(chainId);
  return config?.TOKEN || {};
}

// Utility function to get modules for Aptos chain
export function getAptosModules(chainId: number): Record<string, string> {
  const config = getAptosChainConfig(chainId);
  return config?.MODULE || {};
}

// Utility function to get Aptos chain config by network name
export function getAptosConfigByNetwork(network: 'mainnet' | 'testnet' | 'devnet'): AptosChainConfig | null {
  switch (network) {
    case 'mainnet':
      return AptosMainnetConfig;
    case 'testnet':
      return AptosTestnetConfig;
    default:
      return null;
  }
}

// Export default configurations based on environment
export const DEFAULT_APTOS_CHAIN_ID = process.env.APTOS_NETWORK === 'mainnet' ? 1 : 2;
export const DEFAULT_APTOS_CONFIG = process.env.APTOS_NETWORK === 'mainnet' ? AptosMainnetConfig : AptosTestnetConfig;