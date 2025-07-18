import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  UpdateRefByOfOneUserDto,
  UpdateRefCodeOfOneUserDto,
  UpdateUserNameDto,
} from './dto/updateUserDto';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/common/config/multer.config';
import { UploadImageDto } from './dto/uploadImageDto';
import { RedisService } from 'src/shared/services/redis.service';

import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  @UseGuards(JwtGuard)
  @Get('detail')
  async getDetailUserByAddress(@Request() req: any) {
    return await this.userService.getDetailUserByAddress(
      req.user.walletAddress.toLowerCase(),
    );
  }

  @ApiOperation({ description: 'Get embedded wallet information by wallet address' })
  @Get('embedded-wallet')
  async getEmbeddedWallet(
    @Query('walletAddress') walletAddress: string,
  ) {
    if (!walletAddress) {
      throw new BadRequestException('Wallet address is required');
    }
    
    return await this.userService.getEmbeddedWalletByAddress(
      walletAddress.toLowerCase(),
    );
  }

  @UseGuards(JwtGuard)
  @ApiOperation({ description: 'Export embedded wallet private key' })
  @Get('embedded-wallet/export')
  async exportEmbeddedWallet(@Request() req: any) {
    return await this.userService.exportEmbeddedWalletByAddress(
      req.user.walletAddress.toLowerCase(),
    );
  }

  @UseGuards(JwtGuard)
  @ApiOperation({ description: 'Get user referral code' })
  @Get('referral-code')
  async getRefCode(@Request() req: any) {
    return await this.userService.getRefCodeOfUser(
      req.user.walletAddress.toLowerCase(),
    );
  }

  @UseGuards(JwtGuard)
  @ApiOperation({ description: 'update user referral code' })
  @Post('referral-code')
  async updateRefCode(
    @Request() req: any,
    @Body() updateRefCodeOfOneUserDto: UpdateRefCodeOfOneUserDto,
  ) {
    return await this.userService.updateRefCodeOfOneUser(
      req.user.walletAddress.toLowerCase(),
      updateRefCodeOfOneUserDto.refCode,
      true,
    );
  }

  @UseGuards(JwtGuard)
  @ApiOperation({ description: 'update user referral by which ref code' })
  @Post('referral-by')
  async updateRefBy(
    @Request() req: any,
    @Body() updateRefByOfOneUserDto: UpdateRefByOfOneUserDto,
  ) {
    return await this.userService.updateRefByOfOneUser(
      req.user.walletAddress.toLowerCase(),
      updateRefByOfOneUserDto.refBy,
    );
  }

  //@todo jwt guard this
  @ApiOperation({ description: 'Get random referral code' })
  @Get('random-referral-code')
  async getRandomRefCode(@Request() req: any) {
    return await this.userService.getRandomRefCode();
  }

  // upload profile picture
  @UseGuards(JwtGuard)
  @Get('profile-picture')
  async getProfilePicture(@Request() req: any) {
    return await this.userService.getProfilePicture(
      req.user.walletAddress.toLowerCase(),
    );
  }

  @UseGuards(JwtGuard)
  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  async uploadProfilePicture(
    @Request() req: any,
    @UploadedFile()
    file: Express.Multer.File,
    @Body() uploadImageDto: UploadImageDto,
  ) {
    const walletAddress = req.user.walletAddress.toLowerCase() as string;
    return await this.userService.uploadProfilePicture({
      walletAddress: walletAddress,
      fileBuffer: file.buffer,
    });
  }

  // change user name
  @UseGuards(JwtGuard)
  @Post('user-name')
  async updateUserName(
    @Request() req: any,
    @Body() updateUserNameDto: UpdateUserNameDto,
  ) {
    const walletAddress = req.user.walletAddress.toLowerCase() as string;
    return await this.userService.updateUserName(
      walletAddress,
      updateUserNameDto.userName,
    );
  }

  // load cache to redis
  @UseGuards(JwtGuard)
  @Post('/admin/load-cache')
  async loadCache(@Request() req: any) {
    const walletAddress = req.user.walletAddress.toLowerCase() as string;
    if (
      walletAddress.toLowerCase() !==
      '0x09662688c9eb20773Ec34Cb6ae276C683f8b9d4a'.toLowerCase()
    ) {
      return 'Unauthorized to update';
    }
    return await this.userService.loadAllRefCodeSetToCacheOnBootstrap();
  }
}
