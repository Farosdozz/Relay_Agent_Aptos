import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory, MemoryDocument } from './memory.schema';

describe('MemorySchema', () => {
  let memoryModel: Model<MemoryDocument>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Memory.name),
          useValue: {
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    memoryModel = module.get<Model<MemoryDocument>>(getModelToken(Memory.name));
  });

  describe('Schema Validation', () => {
    it('should validate required fields', () => {
      const validMemory = {
        userId: 'user123',
        sessionId: 'session123',
        role: 'user',
        synced: false,
        content: {
          text: 'Hello AI',
        },
      };

      const memory = new memoryModel(validMemory);
      expect(memory.userId).toBe(validMemory.userId);
      expect(memory.sessionId).toBe(validMemory.sessionId);
      expect(memory.role).toBe(validMemory.role);
      expect(memory.content.text).toBe(validMemory.content.text);
    });

    it('should accept valid roles', () => {
      const validRoles = ['system', 'user', 'assistant', 'tool'];
      
      validRoles.forEach(role => {
        const memory = new memoryModel({
          userId: 'user123',
          sessionId: 'session123',
          role,
          content: { text: 'test' },
        });
        expect(memory.role).toBe(role);
      });
    });

    it('should accept optional metadata', () => {
      const memory = new memoryModel({
        userId: 'user123',
        sessionId: 'session123',
        role: 'tool',
        content: { text: 'Tool execution result' },
        metadata: {
          toolName: 'aptos_transfer_token',
          args: { to: '0x123', amount: 10 },
          transactionHash: '0xabc',
        },
      });

      expect(memory.metadata).toBeDefined();
      expect(memory.metadata.toolName).toBe('aptos_transfer_token');
    });

    it('should accept session metadata', () => {
      const memory = new memoryModel({
        userId: 'user123',
        sessionId: 'session123',
        role: 'system',
        content: { text: 'Session metadata' },
        metadata: {
          isSessionMetadata: true,
          title: 'APT Transfer Chat',
          chain: 'mainnet',
          walletAddress: '0x1234567890abcdef',
        },
      });

      expect(memory.metadata.isSessionMetadata).toBe(true);
      expect(memory.metadata.chain).toBe('mainnet');
    });
  });
});