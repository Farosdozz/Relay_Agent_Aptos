import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

export interface EncryptedData {
  data: string;
  keyId: string;
}
@Injectable()
export class AwsKmsService {
  logger = new Logger(AwsKmsService.name);
  private kms: AWS.KMS;
  private env = process.env.NODE_ENV || 'development';
  keyAlias: string;

  constructor(private readonly configService: ConfigService) {
    this.kms = new AWS.KMS();
    this.keyAlias = configService.get<string>('awsKmsService.keyAlias');
  }

  async encryptData(data: string): Promise<EncryptedData> {
    if (this.env == 'development') {
      return {
        data: data,
        keyId: 'development',
      };
    }
    if (!this.keyAlias) {
      this.logger.error('No keyAlias for encrypting data');
      throw new HttpException('Failed to encrypt data', HttpStatus.BAD_REQUEST);
    }

    const params = {
      KeyId: `alias/${this.keyAlias}`,
      Plaintext: Buffer.from(data),
      // EncryptionAlgorithm: "RSAES_OAEP_SHA_256"
    };
    try {
      const result = await this.kms.encrypt(params).promise();
      const encrypted = result.CiphertextBlob.toString('base64');
      return {
        data: encrypted,
        keyId: result.KeyId,
      };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Failed generated wallet',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //using symmetric key then don't need key Id. If using asymmetric key then need key Id
  async decryptData(encryptedData: string, keyId: string) {
    if (this.env == 'development') {
      return {
        data: encryptedData,
        keyId: 'development',
      };
    }

    try {
      const params = {
        CiphertextBlob: Buffer.from(encryptedData, 'base64'),
        KeyId: keyId,
      };
      const result = await this.kms.decrypt(params).promise();
      return {
        data: result.Plaintext.toString('utf-8'),
        keyId: keyId,
      };
    } catch (e) {
      this.logger.error(e);
      throw new HttpException(
        'Failed to get selected wallet',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
