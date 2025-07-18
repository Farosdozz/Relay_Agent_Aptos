import { useQuery } from '@tanstack/react-query';
import { APTOS_TOKENS } from '@/constants/actions';
import { CHAIN_ID } from '@/constants';

interface TokenPrice {
  price: number;
  isLoading: boolean;
  isError: boolean;
}

const BINANCE_API_BASE = 'https://api.binance.com/api/v3';
const fetchBinancePrice = async (symbol: string): Promise<number> => {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch price from Binance');
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Error fetching Binance price:', error);
    return 0;
  }
};

const fetchDexScreenerPrice = async (chainId: any, pairAddress: string): Promise<number> => {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${chainId === CHAIN_ID.TESTNET ? 'aptos-testnet' : 'aptos'}/${pairAddress}`,
    );
    if (!response.ok) throw new Error('Failed to fetch price from DexScreener');
    const data = await response.json();
    return parseFloat(data.pairs[0]?.priceUsd || '0');
  } catch (error) {
    console.error('Error fetching DexScreener price:', error);
    return 0;
  }
};


// Pure function to get token price - no hooks
export const getTokenPrice = async (chainId: any, tokenSymbol: string): Promise<number> => {
  const token = APTOS_TOKENS.find((t) => t.value === tokenSymbol);
  if (!token) return 0;

  // Return 1 for stablecoins
  if (token.isStablecoin) return 1;

  // Handle APT token
  if (token.value === 'APT') {
    return fetchBinancePrice('APTUSDT');
  }

  // Handle tokens with pairs if they exist (not applicable for current APTOS_TOKENS)
  // This is kept for future expansion when Aptos DEX pairs are added

  // For other Aptos tokens, we might need to implement Aptos-specific price fetching
  // For now, return 0 if no price source is available
  return 0;
};

export const useTokenPrice = (tokenSymbol: string): TokenPrice => {
  
  const chainId = CHAIN_ID.MAINNET;
  
  const {
    data: price = 0,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tokenPrice', tokenSymbol, chainId],
    queryFn: () => getTokenPrice(chainId, tokenSymbol),
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    price,
    isLoading,
    isError,
  };
};
