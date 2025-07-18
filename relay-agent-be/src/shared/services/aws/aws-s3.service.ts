import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  logger = new Logger(AwsS3Service.name);
  private s3: AWS.S3;
  private rootBucket: string = process.env.ROOT_BUCKET;

  constructor() {
    this.s3 = new AWS.S3();
  }

  async uploadFile(file: any, fileName: string, path: string): Promise<string> {
    const params = {
      Bucket: this.rootBucket,
      Key: `${path}/${fileName}`,
      Body: file,
    };
    try {
      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async deleteFile(fileName: string, path: string): Promise<void> {
    const params = {
      Bucket: this.rootBucket,
      Key: `${path}/${fileName}`,
    };
    try {
      await this.s3.deleteObject(params).promise();
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }

  async getFile(
    fileName: string,
    path: string,
    secondsToExpire: number,
  ): Promise<any> {
    const params = {
      Bucket: this.rootBucket,
      Key: `${path}/${fileName}`,
      Expires: secondsToExpire, // seconds
    };
    try {
      const result = await this.s3.getSignedUrl('getObject', params);
      return result;
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
