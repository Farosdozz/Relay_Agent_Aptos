import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/createUserDto';
import { ConfigService } from '@nestjs/config';
import {
  CreateUserFirstLoginDto,
  CreateUserWithTwitterDto,
  RemoveUserRefreshTokenDto,
  UpdateUserRefreshTokenDto,
} from './dto/updateUserDto';
import { UserRepository } from './user.repository';
import { User } from './user.schema';
import {
  CACHE_KEYS,
  HALF_DAY_TTL,
  ONE_HOUR_TTL,
  REF_CODE_CHARACTERS,
  REF_CODE_MAX_LENGTH,
  SEVEN_DAY_TTL,
  THIRTY_DAYS_TTL,
} from 'src/common/constants';
import { UploadProfilePictureDto } from './dto/uploadImageDto';
import { AvatarService } from 'src/shared/services/avatar/avatar.service';
import { RedisService } from 'src/shared/services/redis.service';
import { ALL_REF_CODES } from '../../../all-ref-codes';
import { writeFileSync } from 'fs';
import { EncryptService } from 'src/shared/services/encrypt/encrypt.service';

@Injectable()
export class UserService {
  logger = new Logger(UserService.name);

  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepository,
    private readonly avatarService: AvatarService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly encryptService: EncryptService,
  ) {}

  // for checking ref code exists
  async loadAllRefCodeSetToCacheOnBootstrap() {
    let allRefCodes = ALL_REF_CODES;
    const users = (
      await this.userRepository.findAll({
        createdAt: { $gt: new Date('1 April 2024 00:00 UTC') },
      })
    ).items;
    users
      .map((user) =>
        user.userProfile.refCode
          ? allRefCodes.push(user.userProfile.refCode)
          : null,
      )
      .filter((value) => value);
    const latestAllRefCodes = Array.from(new Set(allRefCodes));
    writeFileSync('all-ref-codes.json', JSON.stringify(latestAllRefCodes));
    const redisClient = this.redisService.getRedisClient();
    const redisClientMulti = redisClient.multi();
    for (var i = 0; i < allRefCodes.length; i++) {
      redisClientMulti.sadd(CACHE_KEYS.ALL_REF_CODE, allRefCodes[i]);
    }
    await redisClientMulti.exec(function (errors, results) {});
    this.logger.log(
      `${await redisClient.scard(CACHE_KEYS.ALL_REF_CODE)} ref code set is loaded in cache`,
    );
  }

  async getUserCount() {
    const users = await this._getUsers();
    return users.length;
  }

  async _getPregeneratedRefCode() {
    const redisClient = this.redisService.getRedisClient();
    const refCode = await redisClient.lpop(
      `${CACHE_KEYS.PREGENERATED_REF_CODE_LIST}`,
    );
    if (!refCode) {
      await this._loadPregeneratedRefCodeListToCache();
      return await redisClient.lpop(`${CACHE_KEYS.PREGENERATED_REF_CODE_LIST}`);
    } else return refCode;
  }

  async _loadPregeneratedRefCodeListToCache() {
    try {
      const pregenRefCodeList = this._getPregeneratedRefCodeList(100000);
      const redisClient = this.redisService.getRedisClient();
      const redisClientMulti = redisClient.multi();
      for (var i = 0; i < pregenRefCodeList.length; i++) {
        redisClientMulti.rpush(
          `${CACHE_KEYS.PREGENERATED_REF_CODE_LIST}`,
          pregenRefCodeList[i],
        );
      }
      await redisClientMulti.exec(function (errors, results) {});
      this.logger.log(
        `${await redisClient.llen(`${CACHE_KEYS.PREGENERATED_REF_CODE_LIST}`)} pregenerated ref code is generated`,
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  _getPregeneratedRefCodeList(count: number) {
    const refCodeList = [];
    for (let i = 0; i < count; i++) {
      const refCode = this._generateOneRefCode();
      refCodeList.push(refCode);
    }
    const set = new Set(refCodeList);
    return Array.from(set) as string[];
  }

  private async _getUsers(): Promise<User[]> {
    return await this.redisService.getDataFromCacheOrAPI(
      `${CACHE_KEYS.ALL_USERS}`,
      async () => {
        return (await this.userRepository.findAll({})).items;
      },
      HALF_DAY_TTL,
    );
  }

  async getDetailUserByAddress(walletAddress: string): Promise<User> {
    return await this.redisService.getDataFromCacheOrAPI(
      `${CACHE_KEYS.USER_DETAIL}${walletAddress.toLowerCase()}`,
      async (): Promise<User> => {
        try {
          const userInfo = await this.userRepository.findOneByCondition({
            walletAddress: walletAddress.toLowerCase(),
          });
          // get avatar access from aws s3
          if (userInfo?.userProfile?.profilePictureUrl) {
            userInfo['userProfile']['profilePictureUrl'] =
              await this.avatarService.getAvatar(userInfo?._id?.toString());
          }
          return userInfo;
        } catch (error) {
          this.logger.error(error);
          throw new HttpException(
            `Failed to get ${walletAddress} info`,
            HttpStatus.BAD_REQUEST,
          );
        }
      },
      SEVEN_DAY_TTL,
    );
  }

  async findOneUser(walletAddress: string) {
    return await this.getDetailUserByAddress(walletAddress);
  }

  async findOneByUserIdWithPrivateKey(userId: string) {
    return await this.userRepository.findOneByUserIdWithPrivateKey(userId);
  }

  async getPrivyProfileOfUserByUserId(userId: string) {
    return await this.userRepository.findOneByConditionAndSelect(
      {
        _id: userId,
      },
      ['walletAddress', 'privyProfile'],
    );
  }

  async getPrivyProfileOfUser(walletAddress: string) {
    return await this.userRepository.findOneByConditionAndSelect(
      {
        walletAddress: walletAddress.toLowerCase(),
      },
      ['walletAddress', 'privyProfile'],
    );
  }

  async findOneWithRefCode(refCode: string) {
    return await this.userRepository.findOneByCondition({
      'userProfile.refCode': refCode,
    });
  }

  async getRefreshTokenOfUser(walletAddress: string) {
    return await this.userRepository.findOneByConditionAndSelect(
      {
        walletAddress: walletAddress,
      },
      ['refreshToken'],
    );
  }

  async findOneWithUserName(userName: string) {
    return await this.userRepository.findOneByCondition({
      walletAddress: userName,
    });
  }

  async createUser(createUserDto: CreateUserDto, refreshToken: string) {
    const user = await this.userRepository.updateOneUserByWalletAddress(
      createUserDto.walletAddress,
      { refreshToken: refreshToken },
    );
    return user;
  }

  async createUserFirstLogin(createUserFirstLoginDto: CreateUserFirstLoginDto) {
    try {
      const { walletAddress, walletProfile } =
        createUserFirstLoginDto;
      let user = await this.getDetailUserByAddress(walletAddress);

      // Update with Privy profile if provided
      if (walletProfile) {
        await this.userRepository.updateOneUserByWalletAddress(walletAddress, {
          walletProfile,
        });
      }

      if (!user?.userProfile?.refCode) {
        const refCode = await this.getRandomRefCode();
        await this.updateRefCodeOfOneUser(walletAddress, refCode, false);
        return await this.getDetailUserByAddress(walletAddress);
      } else {
        return await this.getDetailUserByAddress(walletAddress);
      }
    } catch (error) {
      this.logger.error(error);
    }
  }

  async removeUserRefreshToken(
    removeUserRefreshTokenDto: RemoveUserRefreshTokenDto,
  ) {
    const user = await this.userRepository.updateOneUserByWalletAddress(
      removeUserRefreshTokenDto.walletAddress,
      { refreshToken: null },
    );
    return user;
  }
  async update(walletAddress: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(walletAddress, updateUserDto);
  }

  // ref code
  async getRefCodeOfUser(walletAddress: string) {
    const userInfo = await this.userRepository.findOneByCondition({
      walletAddress: walletAddress,
    });

    // only return the last refCode of user
    return { refCode: userInfo.userProfile?.refCode };
  }

  async updateRefCodeOfOneUser(
    walletAddress: string,
    refCode: string,
    isRefCodeUpdatedByUser: boolean,
  ) {
    const userInfo = await this.findOneUser(walletAddress);

    if (userInfo?.userProfile?.isRefCodeUpdatedByUser) {
      throw new HttpException(
        `${walletAddress} has already updated ref code once`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (await this._isRefCodeExisted(refCode)) {
      throw new HttpException(
        `${refCode} referral code is existed`,
        HttpStatus.CONFLICT,
      );
    }
    await this.userRepository.updateRefCodeOfOneUser(
      walletAddress.toLowerCase(),
      refCode,
      isRefCodeUpdatedByUser,
    );
    const redisClient = this.redisService.getRedisClient();
    await redisClient.sadd(CACHE_KEYS.ALL_REF_CODE, refCode);

    return this.getRefCodeOfUser(walletAddress);
  }

  async getOneUserByRefCode(refCode: string) {
    return await this.userRepository.findOneUserByRefCode(refCode);
  }

  async getRandomRefCode() {
    try {
      //@todo cache this
      let generatedRefCode: string = '';
      while (true) {
        generatedRefCode = await this._getPregeneratedRefCode();
        // check if ref code is existed
        if (await this._isRefCodeExisted(generatedRefCode)) {
          continue;
        } else break;
      }
      return generatedRefCode;
    } catch (error) {
      this.logger.error('getRandomRefCode' + error);
      throw new HttpException(
        'Failed to get random referral code',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateRefByOfOneUser(walletAddress: string, refBy: string) {
    const userInfo = await this.findOneUser(walletAddress);

    if (userInfo.userProfile.refBy) {
      throw new HttpException(
        `${walletAddress} is already referred by ${refBy}`,
        HttpStatus.CONFLICT,
      );
    }

    if (userInfo.userProfile.refCode === refBy) {
      throw new HttpException(
        `${refBy} is your (${walletAddress}) referral code`,
        HttpStatus.CONFLICT,
      );
    }

    if (await this._isRefCodeExisted(refBy)) {
      await this.userRepository.updateRefByOfOneUser(walletAddress, refBy);
      return await this.userRepository.updateRefCountOfOneUser(refBy);
    } else {
      throw new HttpException(
        `${refBy} referral code is not existed`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async _isRefCodeExisted(refCode: string): Promise<boolean> {
    const redisClient = this.redisService.getRedisClient();
    return (await redisClient.sismember(CACHE_KEYS.ALL_REF_CODE, refCode)) === 1
      ? true
      : false;
  }

  _generateOneRefCode() {
    try {
      let refCode = '';
      const charactersLength = REF_CODE_CHARACTERS.length;
      let counter = 0;
      while (counter < REF_CODE_MAX_LENGTH) {
        refCode += REF_CODE_CHARACTERS.charAt(
          Math.floor(Math.random() * charactersLength),
        );
        counter += 1;
      }
      return refCode;
    } catch (error) {
      this.logger.error(error);
    }
  }

  // profile picture
  async uploadProfilePicture(uploadProfilePicture: UploadProfilePictureDto) {
    const userInfo = await this.findOneUser(uploadProfilePicture.walletAddress);

    if (userInfo?.userProfile?.profilePictureUrl) {
      const deletedFile = await this._deleteUserProfilePicture(
        uploadProfilePicture.walletAddress,
      );
    }

    const uploadedFile = await this.avatarService.uploadAvatar(
      uploadProfilePicture.fileBuffer,
      userInfo._id,
    );

    // save profile picture url in user schema
    const profilePictureUrl = await this.avatarService.getAvatar(userInfo._id);
    const updatedUser = await this._updateUserProfilePicture(
      uploadProfilePicture.walletAddress,
      profilePictureUrl,
    );
    return updatedUser;
  }

  private async _deleteUserProfilePicture(walletAddress: string) {
    // delete profile picture in user schema
    const userInfo =
      await this.userRepository.deleteUserProfilePicture(walletAddress);
    // delete profile picture on aws s3
    return await this.avatarService.deleteAvatar(userInfo._id);
  }

  private async _updateUserProfilePicture(
    walletAddress: string,
    profilePictureUrl: string,
  ) {
    try {
      const userInfo = await this.userRepository.updateUserProfilePicture(
        walletAddress,
        profilePictureUrl,
      );
      return userInfo.userProfile;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Failed to update user name',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getProfilePicture(walletAddress: string) {
    try {
      const data = await this.redisService.getDataFromCacheOrAPI(
        `${CACHE_KEYS.PROFILE_PICTURE}${walletAddress}`,
        async () => {
          try {
            const userInfo = await this.findOneUser(walletAddress);
            const profilePictureUrl = await this.avatarService.getAvatar(
              userInfo._id,
            );
            const updatedUser = await this._updateUserProfilePicture(
              walletAddress,
              profilePictureUrl,
            );
            return updatedUser?.profilePictureUrl;
          } catch (error) {
            this.logger.error(error);
          }
        },
        SEVEN_DAY_TTL,
      );
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Failed to get user profile picture',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // user name
  async updateUserName(walletAddress: string, userName: string) {
    try {
      const userInfo = await this.userRepository.updateUserName(
        walletAddress,
        userName,
      );
      return userInfo.userProfile;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Failed to update user name',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Twitter connect
  async updateUserWithTwitter(
    walletAddress: string,
    createUserWithTwitterDto: CreateUserWithTwitterDto,
  ) {
    const user = await this.findOneUser(walletAddress);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userByTwitter = await this.userRepository.findOneByCondition({
      'twitter.twitterId': createUserWithTwitterDto.twitterId,
    });
    if (userByTwitter && userByTwitter.walletAddress !== walletAddress) {
      throw new BadRequestException(
        'This Twitter account is already linked to another wallet address. Please use a different Twitter account or unlink it from the other wallet first.',
      );
    }

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const updateUser = await this.userRepository.findOneAndUpdate(
      { walletAddress: walletAddress },
      {
        twitter: {
          twitterId: createUserWithTwitterDto.twitterId,
          username: createUserWithTwitterDto.username,
          name: createUserWithTwitterDto.name,
          profileImageUrl: createUserWithTwitterDto.profileImageUrl,
          accessToken: createUserWithTwitterDto.accessToken,
          refreshToken: createUserWithTwitterDto.refreshToken,
        },
      },
      options,
    );

    // Clear user details cache
    await this.redisService.del(
      `${CACHE_KEYS.USER_DETAIL}${walletAddress.toLowerCase()}`,
    );

    return updateUser;
  }

  async removeTwitterProfile(walletAddress: string) {
    const user = await this.getDetailUserByAddress(walletAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const updateUser = await this.userRepository.findOneAndUpdate(
      { walletAddress: walletAddress },
      {
        twitter: {},
      },
      options,
    );

    // Clear user details cache
    await this.redisService.del(
      `${CACHE_KEYS.USER_DETAIL}${walletAddress.toLowerCase()}`,
    );
    return updateUser;
  }

  async updateUserWithTelegram(walletAddress: string, telegramData: any) {
    const user = await this.getDetailUserByAddress(walletAddress);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userByTelegram = await this.userRepository.findOneByCondition({
      'telegram.telegramId': telegramData.id,
    });

    if (userByTelegram && userByTelegram.walletAddress !== walletAddress) {
      throw new BadRequestException('Telegram ID already exists');
    }

    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    const updateUser = await this.userRepository.findOneAndUpdate(
      { walletAddress: walletAddress },
      {
        telegram: {
          telegramId: telegramData.id,
          username: telegramData.username,
          firstName: telegramData.first_name,
          lastName: telegramData.last_name,
          photoUrl: telegramData.photo_url,
        },
      },
      options,
    );

    return updateUser;
  }

  async findOneByWalletAddress(walletAddress: string) {
    return await this.userRepository.findOneByWalletAddress(walletAddress);
  }

  async getAllUser(condition?: any) {
    const users = await this.userRepository.findAll(condition);
    return users.items;
  }

  async findOneByUserId(userId: string) {
    return await this.userRepository.findOneByUserId(userId);
  }

  /**
   * Update user's wallet profile (embedded wallet)
   */
  async updateWalletProfile(userId: string, walletProfile: any) {
    try {
      const user = await this.userRepository.findOneByUserId(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.userRepository.findOneAndUpdate(
        { _id: userId },
        { walletProfile },
        { new: true },
      );

      // Clear cache for the user
      await this.redisService.del(
        `${CACHE_KEYS.USER_DETAIL}${user.walletAddress}`,
      );

      return updatedUser;
    } catch (error) {
      this.logger.error('Failed to update wallet profile:', error);
      throw new HttpException(
        'Failed to update wallet profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get user's embedded wallet information
   */
  async getEmbeddedWallet(userId: string) {
    try {
      const user = await this.userRepository.findOneByUserId(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.walletProfile?.walletAddress) {
        return {
          hasEmbeddedWallet: false,
          message: 'No embedded wallet found for this user',
        };
      }

      // Return wallet info without the encrypted private key
      return {
        hasEmbeddedWallet: true,
        walletAddress: user.walletProfile.walletAddress,
        network: user.walletProfile.network,
        createdAt: user.walletProfile.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to get embedded wallet:', error);
      throw new HttpException(
        'Failed to get embedded wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get embedded wallet information by wallet address
   */
  async getEmbeddedWalletByAddress(walletAddress: string) {
    try {
      const user = await this.userRepository.findOneByWalletAddress(walletAddress);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.walletProfile?.walletAddress) {
        return {
          hasEmbeddedWallet: false,
          message: 'No embedded wallet found for this user',
        };
      }

      // Return wallet info without the encrypted private key
      return {
        hasEmbeddedWallet: true,
        walletAddress: user.walletProfile.walletAddress,
        network: user.walletProfile.network,
        createdAt: user.walletProfile.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to get embedded wallet by address:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get embedded wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export embedded wallet private key for authenticated user
   */
  async exportEmbeddedWallet(userId: string) {
    try {
      // Get user including the encrypted private key field
      const user = await this.userRepository.findOneByUserIdWithPrivateKey(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.walletProfile?.encryptedPrivateKey) {
        return {
          hasEmbeddedWallet: false,
          message: 'No embedded wallet found for this user',
        };
      }

      // Decrypt the private key
      const decryptedPrivateKey = this.encryptService.decrypKeyHash(
        user.walletProfile.encryptedPrivateKey,
      );

      return {
        walletAddress: user.walletProfile.walletAddress,
        network: user.walletProfile.network,
        privateKey: decryptedPrivateKey,
        createdAt: user.walletProfile.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to export embedded wallet:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to export embedded wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Export embedded wallet private key by wallet address
   */
  async exportEmbeddedWalletByAddress(walletAddress: string) {
    try {
      // Get user including the encrypted private key field
      const user = await this.userRepository.findOneByWalletAddressWithPrivateKey(walletAddress);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.walletProfile?.encryptedPrivateKey) {
        return {
          hasEmbeddedWallet: false,
          message: 'No embedded wallet found for this user',
        };
      }

      // Decrypt the private key
      const decryptedPrivateKey = this.encryptService.decrypKeyHash(
        user.walletProfile.encryptedPrivateKey,
      );

      return {
        walletAddress: user.walletProfile.walletAddress,
        network: user.walletProfile.network,
        privateKey: decryptedPrivateKey,
        createdAt: user.walletProfile.createdAt,
      };
    } catch (error) {
      this.logger.error('Failed to export embedded wallet by address:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        'Failed to export embedded wallet',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Wallet integration methods (unified for all wallet types including Aptos)
   */
  async createUserWithWalletAddress(data: { walletAddress: string }) {
    try {
      const normalizedAddress = data.walletAddress.toLowerCase();

      // Check if user already exists
      let user = await this.findOneByWalletAddress(normalizedAddress);

      if (!user) {
        // Create new user with wallet address
        user =
          await this.userRepository.createUserWithWalletAddress(
            normalizedAddress,
          );

        // Generate and assign a ref code if not exists
        if (!user.userProfile?.refCode) {
          const refCode = await this.getRandomRefCode();
          await this.updateRefCodeOfOneUser(normalizedAddress, refCode, false);
          user = await this.findOneByWalletAddress(normalizedAddress);
        }
      } else {
        // Update last login time for existing user
        const lastLoginAt = new Date();
        await this.userRepository.updateOneUserByWalletAddress(
          normalizedAddress,
          {
            lastLoginAt,
          },
        );
        user.lastLoginAt = lastLoginAt;
      }

      // Clear cache for the user
      await this.redisService.del(
        `${CACHE_KEYS.USER_DETAIL}${normalizedAddress}`,
      );

      return user;
    } catch (error) {
      this.logger.error('Failed to create user with wallet address:', error);
      throw new HttpException(
        'Failed to create user account',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
