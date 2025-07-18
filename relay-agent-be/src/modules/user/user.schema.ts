import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { BaseSchema } from 'src/common/schema/base.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class UserProfile {
  @Prop({})
  profilePictureUrl: string;

  @Prop({ required: true, lowercase: true })
  userName: string;

  @Prop({
    required: false,
    type: String,
  })
  refCode: string;

  @Prop({ required: true, type: Boolean, default: false })
  isRefCodeUpdatedByUser: boolean;

  @Prop({ required: false })
  refBy: string;

  @Prop({ required: true, type: Number, default: 0 })
  refCount: number;
}

@Schema()
export class TwitterProfile {
  @Prop({ required: true, index: true, type: String })
  twitterId: string;

  @Prop({ type: String })
  username?: string;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String })
  profileImageUrl?: string;

  @Prop({ type: String, select: false })
  refreshToken?: string;

  @Prop({ type: String, select: false })
  accessToken?: string;

  @Prop({ type: Date, select: false })
  accessTokenExpiry?: Date;
}

@Schema()
export class WalletProfile {
  @Prop({ required: true, index: true, type: String })
  walletAddress: string;

  @Prop({ required: true, type: String })
  network: string;

  @Prop({ type: String, select: false })
  encryptedPrivateKey?: string;

  @Prop({ type: Date })
  createdAt?: Date;
}

@Schema({
  toJSON: {
    // format data before returning response
    getters: true,
  },
})
export class User extends BaseSchema {
  @Prop({ required: true, lowercase: true, index: true })
  walletAddress: string;

  @Prop({ required: true, type: UserProfile, default: {} })
  userProfile: UserProfile;

  @Prop({ required: false, type: TwitterProfile, default: {} })
  twitter?: TwitterProfile;

  @Prop({ required: false, type: WalletProfile, default: {} })
  walletProfile?: WalletProfile;

  @Prop({ required: true, select: false })
  refreshToken: string;

  @Prop({ type: Number, default: 0 })
  point: number;

  @Prop({ type: Date })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ 'userProfile.refCode': 1, 'userProfile.refBy': 1 });

UserSchema.index({ isKOL: 1 });

UserSchema.index({ walletAddress: 1 });
