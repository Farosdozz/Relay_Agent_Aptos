// Base from list token at constants/actions.ts
// get price with useTokenPrice with these tokens
// Then calculate total assets with price and balance each of them
// Return total assets

import { useBalancesQuery } from '@/hooks/useBalancesQuery';
import { getTokenPrice } from './useTokenPrice';
import { useQuery } from '@tanstack/react-query';
import { CHAIN_ID } from '@/constants';

interface TotalAssets {
  tokenPrices: Record<string, number>;
  totalValue: number;
  isLoading: boolean;
  isError: boolean;
}

export const useTotalAssets = (): TotalAssets => {
  const {
    data: balanceData,
    isLoading: isLoadingBalances,
    isError: isErrorBalances,
  } = useBalancesQuery();

  const chainId = CHAIN_ID.MAINNET;

  const balances = balanceData?.balances || [];
  const nativeBalance = balanceData?.nativeBalance || null;

  // Get all unique token symbols that we need prices for
  const tokenSymbols = Array.from(
    new Set([
      ...balances.map((token) => token.symbol),
      ...(nativeBalance ? [nativeBalance.symbol] : []),
    ]),
  );

  // Fetch prices for all tokens in a single query
  const {
    data: tokenPrices = {},
    isLoading: isPricesLoading,
    isError: isPricesError,
  } = useQuery({
    queryKey: ['allTokenPrices', chainId, tokenSymbols],
    queryFn: async () => {
      const pricePromises = tokenSymbols.map(async (symbol) => ({
        symbol,
        price: await getTokenPrice(chainId, symbol),
      }));

      const prices = await Promise.all(pricePromises);

      // Convert array to object with symbols as keys
      return prices.reduce(
        (acc, { symbol, price }) => {
          acc[symbol] = price;
          return acc;
        },
        {} as Record<string, number>,
      );
    },
    enabled: tokenSymbols.length > 0,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Calculate total value from balances and prices
  const totalValue = balances.reduce((acc, token) => {
    // For regular tokens, use token price
    const price = tokenPrices[token.symbol] || 0;
    return acc + price * token.balance;
  }, 0);

  // Determine overall loading and error states
  const isLoading = isLoadingBalances || isPricesLoading;
  const isError = isErrorBalances || isPricesError;

  return {
    tokenPrices,
    totalValue,
    isLoading,
    isError,
  };
};
