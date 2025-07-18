import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EncryptService {
  private readonly secretKey: string;
  private readonly secretIv: string;
  private readonly encryptionMethod: string;
  private readonly key: string;
  private readonly iv: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>(
      'ENCRYPT_SECRET_KEY',
    );
    this.secretIv = this.configService.get<string>(
      'ENCRYPT_SECRET_IV',
    );
    this.encryptionMethod = this.configService.get<string>(
      'ENCRYPT_ENCRYPTION_METHOD',
      'AES-256-CBC',
    );

    if (!this.secretKey || !this.secretIv) {
      throw new Error('ENCRYPT_SECRET_KEY and ENCRYPT_SECRET_IV are required');
    }

    this.key = crypto
      .createHash('sha512')
      .update(this.secretKey, 'utf-8')
      .digest('hex')
      .slice(0, 32);
    this.iv = crypto
      .createHash('sha512')
      .update(this.secretIv, 'utf-8')
      .digest('hex')
      .slice(0, 16);
  }

  encrypKeyHash(plainText: string): string {
    const encryptor = crypto.createCipheriv(
      this.encryptionMethod,
      this.key,
      this.iv,
    );
    const aes_encrypted =
      encryptor.update(plainText, 'utf8', 'base64') +
      encryptor.final('base64');
    return Buffer.from(aes_encrypted).toString('base64');
  }

  decrypKeyHash(encryptedMessage: string): string {
    const buff = Buffer.from(encryptedMessage, 'base64');
    encryptedMessage = buff.toString('utf-8');
    const decryptor = crypto.createDecipheriv(
      this.encryptionMethod,
      this.key,
      this.iv,
    );
    return (
      decryptor.update(encryptedMessage, 'base64', 'utf8') +
      decryptor.final('utf8')
    );
  }
}