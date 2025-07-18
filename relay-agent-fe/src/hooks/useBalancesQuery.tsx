import { APTOS_TOKENS } from '@/constants/actions';
import { ITokenBalance } from '@/interfaces/user.interface';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { QUERY_KEY } from '@/constants/query';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

// Helper function to create default empty balance for Aptos tokens
const createDefaultEmptyBalance = (
  token: (typeof APTOS_TOKENS)[0],
): ITokenBalance => ({
  symbol: token.value,
  name: token.label,
  icon: token.icon,
  balance: 0,
  isLoading: false,
  isError: false,
});

/**
 * Custom hook to fetch Aptos token balances using React Query
 * TODO: Implement actual Aptos balance fetching using Aptos SDK
 */
export const useBalancesQuery = (): UseQueryResult<{
  balances: ITokenBalance[];
  nativeBalance: ITokenBalance | null;
}> => {
  const { connected, account } = useWallet();
  const walletAddress = connected && account ? account.address : undefined;

  return useQuery({
    queryKey: [QUERY_KEY.WALLET_BALANCES, walletAddress],
    queryFn: async () => {
      // Initialize default empty balances for Aptos tokens
      const defaultEmptyBalances = APTOS_TOKENS.map(createDefaultEmptyBalance);

      // If no wallet address, return empty balances
      if (!walletAddress) {
        return {
          balances: defaultEmptyBalances,
          nativeBalance: null,
        };
      }

      try {
        // TODO: Implement actual Aptos balance fetching using Aptos SDK
        // For now, return mock data to prevent compilation errors
        console.log('Fetching Aptos balances for:', walletAddress);

        // Mock balances - replace with actual Aptos SDK calls
        const mockBalances = APTOS_TOKENS.map((token) => ({
          symbol: token.value,
          name: token.label,
          icon: token.icon,
          balance: 0, // TODO: Fetch actual balance from Aptos network
          address: token.address,
          decimals: token.value === 'APT' ? 8 : 6, // APT has 8 decimals, USDC typically has 6
          isLoading: false,
          isError: false,
        }));

        // Find native APT balance
        const nativeTokenBalance = mockBalances.find((token) => token.symbol === 'APT') || null;

        return {
          balances: mockBalances,
          nativeBalance: nativeTokenBalance,
        };
      } catch (error) {
        console.error('Error fetching Aptos balances:', error);
        // Return default empty balances with error state
        return {
          balances: defaultEmptyBalances.map((token) => ({
            ...token,
            isError: true,
          })),
          nativeBalance: null,
        };
      }
    },
    enabled: !!walletAddress && connected,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 15000, // Consider data stale after 15 seconds
  });
};
