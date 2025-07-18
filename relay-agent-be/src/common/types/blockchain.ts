export type LPTokenPair =
  | 'WBERA_HONEY'
  | 'WBTC_WBERA'
  | 'WETH_WBERA'
  | 'BYUSD_HONEY'
  | 'USDCE_HONEY'
  | 'USDC_HONEY'
  | 'WBERA_IBERA';

export interface PoolConfig {
  token: string;
  beraHubVault: string;
  infraredVault: string;
  description: string;
  poolId: string;
}
