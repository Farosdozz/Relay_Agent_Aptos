export interface SessionMetadata {
  chain: 'mainnet' | 'testnet';
  walletAddress?: string;
  model?: string;
  temperature?: number;
  createdAt?: Date;
  lastActive?: Date;
}

export interface Session {
  _id?: string;
  sessionId: string;
  userId: string;
  title: string;
  metadata: SessionMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  messageCount: number;
}

export interface CreateSessionOptions {
  userId: string;
  sessionId?: string;
  title?: string;
  metadata?: Partial<SessionMetadata>;
}