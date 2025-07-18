import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from '../services/ai.service';
import { MemoryService } from '../services/memory.service';
import { UserService } from '../../user/user.service';
import { EncryptService } from '../../../shared/services/encrypt/encrypt.service';
import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk';
import { createAptosTools } from 'move-agent-kit';
import { convertToOpenAIFunctions } from '../utils/tool-adapter.utils';

describe('AiService', () => {
  let service: AiService;
  let memoryService: jest.Mocked<MemoryService>;
  let userService: jest.Mocked<UserService>;
  let encryptService: jest.Mocked<EncryptService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                OPENAI_API_KEY: 'test-key',
                APTOS_NETWORK: 'testnet',
                APTOS_NODE_URL: 'https://testnet.aptoslabs.com',
                OPENAI_MODEL: 'gpt-4-turbo-preview',
                PANORA_API_KEY: 'test-panora-key'
              };
              return config[key];
            }),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneByUserIdWithPrivateKey: jest.fn(),
          },
        },
        {
          provide: MemoryService,
          useValue: {
            addMemory: jest.fn(),
            getFormattedSessionHistory: jest.fn(),
          },
        },
        {
          provide: EncryptService,
          useValue: {
            decrypKeyHash: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    memoryService = module.get(MemoryService);
    userService = module.get(UserService);
    encryptService = module.get(EncryptService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserWallet', () => {
    it('should create a LocalSigner from user wallet profile', async () => {
      // Mock user data
      const mockUser = {
        walletProfile: {
          encryptedPrivateKey: 'encrypted_key_data',
        },
      };

      // Mock a valid Ed25519 private key (64 hex chars)
      const mockPrivateKeyHex = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      
      userService.findOneByUserIdWithPrivateKey.mockResolvedValue(mockUser as any);
      encryptService.decrypKeyHash.mockReturnValue(mockPrivateKeyHex);

      const wallet = await service.getUserWallet('test-user-id');

      expect(userService.findOneByUserIdWithPrivateKey).toHaveBeenCalledWith('test-user-id');
      expect(encryptService.decrypKeyHash).toHaveBeenCalledWith('encrypted_key_data');
      expect(wallet).toBeDefined();
      expect(wallet.constructor.name).toBe('LocalSigner');
    });

    it('should throw error if user has no wallet', async () => {
      const mockUser = {
        walletProfile: null,
      };

      userService.findOneByUserIdWithPrivateKey.mockResolvedValue(mockUser as any);

      await expect(service.getUserWallet('test-user-id')).rejects.toThrow('User wallet not found');
    });
  });

  describe('initializeAgentRuntime', () => {
    it('should create an AgentRuntime instance', async () => {
      // Mock getUserWallet
      const mockPrivateKeyHex = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const privateKey = new Ed25519PrivateKey(mockPrivateKeyHex);
      const account = Account.fromPrivateKey({ privateKey });
      
      jest.spyOn(service, 'getUserWallet').mockResolvedValue({
        account,
        network: 'testnet',
      } as any);

      const runtime = await service.initializeAgentRuntime('test-user-id');

      expect(runtime).toBeDefined();
      expect(runtime.constructor.name).toBe('AgentRuntime');
    });
  });

  describe('Tool Adapter', () => {
    it('should convert Aptos tools to OpenAI functions', () => {
      // Create mock LangChain-style tools
      const mockTools = [
        {
          name: 'aptos_transfer_token',
          description: 'Transfer tokens on Aptos',
          schema: {
            type: 'object',
            properties: {
              to: { type: 'string' },
              amount: { type: 'number' }
            },
            required: ['to', 'amount']
          },
          // Mock other required Tool properties
          call: jest.fn(),
          returnDirect: false,
          verboseParsingErrors: false,
          lc_namespace: ['test'],
          func: async () => 'success'
        }
      ] as any[];

      const openAIFunctions = convertToOpenAIFunctions(mockTools);

      expect(openAIFunctions).toHaveLength(1);
      expect(openAIFunctions[0].type).toBe('function');
      expect(openAIFunctions[0].function.name).toBe('aptos_transfer_token');
      expect(openAIFunctions[0].function.description).toBe('Transfer tokens on Aptos');
      expect(openAIFunctions[0].function.parameters).toEqual({
        type: 'object',
        properties: {
          to: { type: 'string' },
          amount: { type: 'number' }
        },
        required: ['to', 'amount']
      });
    });
  });

  describe('chat', () => {
    it('should handle basic chat without tools', async () => {
      // Mock dependencies
      jest.spyOn(service, 'initializeAgentRuntime').mockResolvedValue({} as any);
      memoryService.getFormattedSessionHistory.mockResolvedValue([
        { role: 'user', content: 'Hello' }
      ]);

      // Mock OpenAI response
      const mockCompletion = {
        choices: [{
          message: {
            content: 'Hello! How can I help you with Aptos?',
            tool_calls: null
          }
        }]
      };
      
      jest.spyOn(service.openai.chat.completions, 'create').mockResolvedValue(mockCompletion as any);

      const result = await service.chat('user-id', 'session-id', 'Hello');

      expect(result.sessionId).toBe('session-id');
      expect(result.message).toBe('Hello! How can I help you with Aptos?');
      expect(memoryService.addMemory).toHaveBeenCalledTimes(2); // user message + assistant response
    });
  });
});