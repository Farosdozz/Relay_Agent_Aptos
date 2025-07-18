import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AptosAuthService } from './aptos-auth.service';
import { RedisService } from 'src/shared/services/redis.service';
import { UserService } from 'src/modules/user/user.service';
import { AptosVerifyRequestDto } from './dtos/aptos-auth.dto';

describe('AptosAuthService', () => {
  let service: AptosAuthService;
  let redisService: jest.Mocked<RedisService>;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    _id: 'user123',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'Test User',
    avatar: null,
    userProfile: {
      refCode: 'TEST123',
    },
  };

  beforeEach(async () => {
    const mockRedisService = {
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    };

    const mockUserService = {
      createUserWithWalletAddress: jest.fn(),
      findOneByWalletAddress: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AptosAuthService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AptosAuthService>(AptosAuthService);
    redisService = module.get(RedisService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Setup default config values
    configService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'APTOS_NETWORK':
          return 'mainnet';
        case 'APTOS_NODE_URL':
          return 'https://fullnode.mainnet.aptoslabs.com/v1';
        case 'jwtService.jwtAccessTokenExpire':
          return '15m';
        case 'jwtService.jwtRefreshTokenExpire':
          return '30d';
        default:
          return undefined;
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateNonce', () => {
    it('should generate a nonce and store it in Redis', async () => {
      redisService.set.mockResolvedValue('OK');

      const result = await service.generateNonce();

      expect(result).toHaveProperty('nonce');
      expect(result).toHaveProperty('expiresAt');
      expect(result.nonce).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(typeof result.expiresAt).toBe('number');
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(result.nonce),
        expect.objectContaining({
          nonce: result.nonce,
          createdAt: expect.any(Number),
          expiresAt: result.expiresAt,
        }),
        300, // 5 minutes TTL
      );
    });

    it('should throw an error if Redis fails', async () => {
      redisService.set.mockRejectedValue(new Error('Redis error'));

      await expect(service.generateNonce()).rejects.toThrow(HttpException);
    });
  });

  describe('refreshToken', () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';

    it('should refresh token successfully', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      const mockAccessToken = 'new-access-token';

      redisService.get.mockResolvedValue(mockRefreshToken);
      jwtService.verify.mockReturnValue({ walletAddress: walletAddress.toLowerCase() });
      userService.findOneByWalletAddress.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue(mockAccessToken);

      const result = await service.refreshToken(walletAddress);

      expect(result).toEqual({
        accessToken: mockAccessToken,
        expiresIn: 900, // 15 minutes in seconds
      });
      expect(redisService.get).toHaveBeenCalledWith(
        expect.stringContaining(walletAddress.toLowerCase()),
      );
      expect(jwtService.verify).toHaveBeenCalledWith(mockRefreshToken);
      expect(userService.findOneByWalletAddress).toHaveBeenCalledWith(walletAddress.toLowerCase());
    });

    it('should throw error if refresh token not found', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(service.refreshToken(walletAddress)).rejects.toThrow(
        new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED),
      );
    });

    it('should throw error if refresh token is invalid', async () => {
      const mockRefreshToken = 'invalid-refresh-token';
      redisService.get.mockResolvedValue(mockRefreshToken);
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken(walletAddress)).rejects.toThrow(
        new HttpException('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED),
      );
      expect(redisService.del).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      redisService.get.mockResolvedValue(mockRefreshToken);
      jwtService.verify.mockReturnValue({ walletAddress: walletAddress.toLowerCase() });
      userService.findOneByWalletAddress.mockResolvedValue(null);

      await expect(service.refreshToken(walletAddress)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('logout', () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';

    it('should logout successfully', async () => {
      const mockRefreshToken = 'valid-refresh-token';
      redisService.get.mockResolvedValue(mockRefreshToken);
      redisService.del.mockResolvedValue(1);

      await service.logout(walletAddress);

      expect(redisService.get).toHaveBeenCalledWith(
        expect.stringContaining(walletAddress.toLowerCase()),
      );
      expect(redisService.del).toHaveBeenCalledWith(
        expect.stringContaining(walletAddress.toLowerCase()),
      );
    });

    it('should throw error if already logged out', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(service.logout(walletAddress)).rejects.toThrow(
        new HttpException('Already logged out', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('verifySignature', () => {
    const mockRequest: AptosVerifyRequestDto = {
      message: `relay-agent.io wants you to sign in with your Aptos account:
0x1234567890abcdef1234567890abcdef12345678

Sign in to Relay Agent

URI: https://relay-agent.io
Version: 1
Chain ID: 1
Nonce: abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
Issued At: 2024-01-01T00:00:00.000Z`,
      signature: '0xsignature123',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      publicKey: '0xpublickey123',
    };

    it('should throw error for invalid nonce', async () => {
      redisService.get.mockResolvedValue(null);

      await expect(service.verifySignature(mockRequest)).rejects.toThrow(
        new HttpException('Invalid or expired nonce', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw error for invalid message format', async () => {
      const invalidRequest = {
        ...mockRequest,
        message: 'Invalid message without nonce',
      };

      await expect(service.verifySignature(invalidRequest)).rejects.toThrow(
        new HttpException('Invalid SIWA message format', HttpStatus.BAD_REQUEST),
      );
    });
  });
});
