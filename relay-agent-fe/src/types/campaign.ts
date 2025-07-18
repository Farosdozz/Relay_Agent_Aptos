export type Mission = {
  name: string;
  description: string;
  requirements: string;
  howToComplete: string;
  conditions: Conditions;
  isActive: boolean;
  missionType: MissionType;
  point: number;
  timestamp: number;
};

export enum Action {
  STAKE = 'stake',
  TRADE = 'trade',
  MINT = 'mint',
  LEND = 'lend',
  BORROW = 'borrow',
  NFT = 'nft',
  SWAP = 'swap',
  ADD_LIQUIDITY = 'add_liquidity',
  JOIN_DISCORD = 'join_discord',
  FOLLOW_TWITTER = 'follow_twitter',
  LIKE_TWITTER = 'like_twitter',
}

export enum MissionType {
  STAKING = 'staking',
  TRADING = 'trading',
  NFT = 'nft',
  LENDING = 'lending',
  STRATEGIES = 'strategies',
}
export enum ConditionsType {
  CUMULATIVE = 'cumulative',
  ONE_TIME = 'one_time',
  REPEATED = 'repeated',
}
export interface Conditions {
  type: ConditionsType;
  protocol: Protocols | null;
  unit: string | null;
  action: Action;
  target: number;
}

export enum Protocols {
  BEX = 'bex',
  HONEY_SWAP = 'honey_swap',
  HONEY_VAULT = 'honey_vault',
  HONEY_FARM = 'honey_farm',
  HONEY_POOL = 'honey_pool',
  HONEY_LENDING = 'honey_lending',
  MARKET_PLACE = 'market_place',
  BERA_CHAIN = 'bera_chain',
}

export enum UserQuestStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type UserQuestTask = {
  userId: string;
  questId: string;
  status: UserQuestStatus;
  progress: number;
  completedAt: number;
  timestamp: number;
};
