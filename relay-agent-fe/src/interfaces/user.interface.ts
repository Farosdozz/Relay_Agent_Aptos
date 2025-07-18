export interface ITokenBalance {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
  balanceRaw?: bigint;
  address?: string;
  decimals?: number;
  isLoading: boolean;
  isError: boolean;
}