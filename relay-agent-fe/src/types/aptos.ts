import { Network } from '@aptos-labs/ts-sdk';

// Aptos Network Configuration
export interface AptosNetworkConfig {
  network: Network;
  nodeUrl: string;
  faucetUrl?: string;
}

// Wallet Info Type (simplified for UI)
export interface WalletInfo {
  name: string;
  icon: string;
  url: string;
  installed: boolean;
  address?: string;
  chainId?: number;
}

// Wallet Adapter Types
export interface AptosWalletContextType {
  wallets: WalletInfo[];
  wallet: WalletInfo | null;
  account: {
    address: string;
    publicKey: string;
  } | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connect(walletName: string): Promise<void>;
  disconnect(): Promise<void>;
  signMessage(message: string): Promise<{ signature: string }>;
  signTransaction(transaction: any): Promise<{ signature: string }>;
}

// Authentication Hook Types
export interface UseAptosAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login(): Promise<void>;
  logout(): Promise<void>;
  refreshToken(): Promise<string | null>;
  error: string | null;
}

export interface AuthUser {
  id: string;
  walletAddress: string;
  name?: string;
  avatar?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  defaultSlippage: number;
  autoApprove: boolean;
  notifications: boolean;
}

// API Types
export interface AptosNonceResponse {
  nonce: string;
  expiresAt: number;
}

export interface AptosVerifyRequest {
  output: any; // SerializedAptosSignInOutput from @aptos-labs/siwa
}

export interface AptosAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// Move Agent Kit Integration Types
export interface MoveAgentKitConfig {
  network: Network;
  nodeUrl: string;
}

export interface TransactionParams {
  function: string;
  typeArguments?: string[];
  functionArguments?: any[];
}

export interface TransactionResult {
  hash: string;
  success: boolean;
  gasUsed?: number;
  error?: string;
}

// DeFi Operation Types
export interface SwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
}

export interface StakeParams {
  token: string;
  amount: string;
  validator?: string;
}

export interface PortfolioData {
  totalValue: string;
  tokens: TokenBalance[];
  stakedTokens: StakedToken[];
  liquidityPositions: LiquidityPosition[];
}

export interface TokenBalance {
  token: string;
  balance: string;
  value: string;
  symbol: string;
  decimals: number;
  logoUrl?: string;
}

export interface StakedToken {
  token: string;
  stakedAmount: string;
  rewards: string;
  validator?: string;
  apy?: number;
}

export interface LiquidityPosition {
  pool: string;
  token0: string;
  token1: string;
  liquidity: string;
  value: string;
  apy?: number;
}

// UI Component Types
export interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletName: string) => Promise<void>;
}

export interface WalletButtonProps {
  wallet: WalletInfo;
  isConnected: boolean;
  isConnecting: boolean;
  onClick: () => void;
}

// Error Types
export enum AptosErrorCode {
  WALLET_NOT_INSTALLED = 'WALLET_NOT_INSTALLED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  USER_REJECTED = 'USER_REJECTED',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  EXPIRED_NONCE = 'EXPIRED_NONCE',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  CONNECTION_TIMEOUT = 'CONNECTION_TIMEOUT',
}

export interface AptosError {
  code: AptosErrorCode;
  message: string;
  details?: any;
  timestamp: string;
}

// Wallet Installation Guide Types
export interface WalletInstallationInfo {
  name: string;
  icon: string;
  downloadUrl: string;
  description: string;
  supported: boolean;
}

// Constants
export const SUPPORTED_WALLETS = [
  'Petra',
  'Martian',
  'Pontem',
  'Rise',
  'Nightly',
  'Fewcha',
  'Spika',
  'Bitkeep',
  'TokenPocket',
] as const;

export type SupportedWalletName = (typeof SUPPORTED_WALLETS)[number];
