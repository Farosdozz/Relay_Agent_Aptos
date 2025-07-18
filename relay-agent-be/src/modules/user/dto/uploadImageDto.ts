import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  file: Express.Multer.File;
}

export class UploadProfilePictureDto {
  @ApiProperty({ type: 'string', required: true })
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({ type: Buffer, required: true })
  fileBuffer: Buffer;
}
