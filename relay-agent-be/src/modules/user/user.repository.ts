import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { BaseRepository } from 'src/common/model/base.repository';
import { User, UserProfile } from './user.schema';
import { RedisService } from 'src/shared/services/redis.service';
import { CACHE_KEYS } from 'src/common/constants';

const BONUS_POINT_FOR_5_MISSION = 100;
const BONUS_POINT_FOR_10_MISSION = 300;
const BONUS_POINT_FOR_15_MISSION = 500;
const BONUS_POINT_FOR_20_MISSION = 1000;

@Injectable()
// implements UserRepositoryInterface
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name)
    private readonly userRepository: Model<User>,
    private readonly redisService: RedisService,
  ) {
    super(userRepository);
  }

  async findOneAndPopulate(
    walletAddress: string,
    populate: string,
  ): Promise<User> {
    return await this.userRepository
      .findOne({
        walletAddress: walletAddress,
      })
      .populate(populate);
  }

  async findOneByUserIdWithPrivateKey(userId: string): Promise<User> {
    return await this.userRepository
      .findOne({ _id: userId, deletedAt: null })
      .select('+walletProfile.encryptedPrivateKey')
      .exec();
  }

  async findOneByWalletAddressWithPrivateKey(walletAddress: string): Promise<User> {
    return await this.userRepository
      .findOne({ walletAddress: walletAddress, deletedAt: null })
      .select('+walletProfile.encryptedPrivateKey')
      .exec();
  }

  async updateOneUserByWalletAddress(
    walletAddress: string,
    update: UpdateQuery<User>,
  ): Promise<User> {
    const query = { walletAddress: walletAddress };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };
    await this._deleteUserCache(walletAddress);
    return await this.userRepository.findOneAndUpdate(query, update, options);
  }

  async updateOneUserDepositTransaction(
    walletAddress: string,
    update: UpdateQuery<User>,
  ): Promise<User> {
    const query = { walletAddress: walletAddress };
    const options = { setDefaultsOnInsert: true };
    await this._deleteUserCache(walletAddress);
    return await this.userRepository.findOneAndUpdate(query, update, options);
  }

  async updateRefCodeOfOneUser(
    walletAddress: string,
    refCode: string,
    isRefCodeUpdatedByUser: boolean,
  ): Promise<User> {
    const query = { walletAddress: walletAddress.toLowerCase() };
    const update = {
      $set: {
        'userProfile.refCode': refCode,
        ...(isRefCodeUpdatedByUser && {
          'userProfile.isRefCodeUpdatedByUser': true,
        }),
      },
    };
    const options = { upsert: true, new: true };
    await this._deleteUserCache(walletAddress.toLowerCase());
    return await this.userRepository.findOneAndUpdate(query, update, options);
  }

  async updateRefByOfOneUser(
    walletAddress: string,
    refBy: string,
  ): Promise<User> {
    const query = { walletAddress: walletAddress };
    const update = { 'userProfile.refBy': refBy };
    const options = { new: true };
    await this._deleteUserCache(walletAddress);
    return await this.userRepository.findOneAndUpdate(query, update, options);
  }

  async updateRefCountOfOneUser(refCode: string) {
    const data = await this.userRepository.findOneAndUpdate(
      {
        'userProfile.refCode': refCode,
      },
      { $inc: { 'userProfile.refCount': 1 } },
      { new: true },
    );
    await this._deleteUserCache(data?.walletAddress);
    return {
      walletAddress: data.walletAddress,
      refCode: data.userProfile.refCode,
    };
  }

  async findOneUserByRefCode(refCode: string) {
    const data = await this.userRepository
      .findOne({
        'userProfile.refCode': refCode,
      })
      .select(['walletAddress', 'userProfile.refCode']);
    await this._deleteUserCache(data?.walletAddress);
    return {
      walletAddress: data.walletAddress,
      refCode: data.userProfile.refCode,
    };
  }

  async updateUserName(walletAddress: string, userName: string): Promise<User> {
    const query = { walletAddress: walletAddress };
    const options = { new: true };
    await this._deleteUserCache(walletAddress);

    return await this.userRepository.findOneAndUpdate(
      query,
      { 'userProfile.userName': userName },
      options,
    );
  }
  async updateUserProfilePicture(
    walletAddress: string,
    profilePictureUrl: string,
  ): Promise<User> {
    const query = { walletAddress: walletAddress };
    const options = { new: true };
    await this._deleteUserCache(walletAddress);

    return await this.userRepository.findOneAndUpdate(
      query,
      { 'userProfile.profilePictureUrl': profilePictureUrl },
      options,
    );
  }

  async deleteUserProfilePicture(walletAddress: string): Promise<User> {
    const query = { walletAddress: walletAddress };
    const options = { new: true };
    await this._deleteUserCache(walletAddress);

    return await this.userRepository.findOneAndUpdate(
      query,
      { $set: { 'userProfile.profilePictureUrl': null } },
      options,
    );
  }

  private async _deleteUserCache(walletAddress: string) {
    await this.redisService.del(
      `${CACHE_KEYS.USER_DETAIL}${walletAddress.toLowerCase()}`,
    );
  }

  async getAllUsers() {
    return this.userRepository.find();
  }

  async findOneByWalletAddress(walletAddress: string) {
    return await this.userRepository.findOne({
      walletAddress: walletAddress,
    });
  }

  async findOneBy(id: string) {
    return await this.userRepository.findOne({ _id: id });
  }

  async findOneByUserId(userId: string) {
    return await this.userRepository.findOne({ _id: userId });
  }

  async createUserWithWalletAddress(walletAddress: string) {
    const query = { walletAddress: walletAddress.toLowerCase() };
    const currentTime = new Date();
    const update = {
      $setOnInsert: {
        walletAddress: walletAddress.toLowerCase(),
        userProfile: {
          userName: `user_${walletAddress.slice(-8)}`,
          refCode: '',
          isRefCodeUpdatedByUser: false,
          refBy: '',
          refCount: 0,
        },
      },
      $set: {
        lastLoginAt: currentTime,
      },
    };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    await this._deleteUserCache(walletAddress.toLowerCase());
    return await this.userRepository.findOneAndUpdate(query, update, options);
  }
}
