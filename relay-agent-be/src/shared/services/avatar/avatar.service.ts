import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { AwsS3Service } from '../aws/aws-s3.service';

@Injectable()
export class AvatarService {
  logger = new Logger(AvatarService.name);
  private env = process.env.NODE_ENV || 'development';
  constructor(private awsS3Service: AwsS3Service) {}
  async uploadAvatar(file: any, user: string): Promise<string> {
    try {
      const fileName = `${user}.png`;
      const filePath = `avatars/${user}/${fileName}`;
      return this.awsS3Service.uploadFile(file, fileName, filePath);
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(
        'Failed to upload avatar',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAvatar(user: string): Promise<any> {
    const fileName = `${user}.png`;
    const filePath = `avatars/${user}/${fileName}`;
    const secondsToExpire = 1000800; // 10 days in seconds
    return this.awsS3Service.getFile(fileName, filePath, secondsToExpire);
  }

  async deleteAvatar(user: string): Promise<void> {
    const fileName = `${user}.png`;
    const filePath = `avatars/${user}/${fileName}`;
    return this.awsS3Service.deleteFile(fileName, filePath);
  }
}
