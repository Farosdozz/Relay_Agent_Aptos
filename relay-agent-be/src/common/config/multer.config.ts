import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

// Multer configuration
export const multerConfig = {
  dest: process.env.UPLOAD_LOCATION,
};

// Multer upload options
export const multerOptions: MulterOptions = {
  // Enable file size limits
  limits: {
    fileSize: 1048576, // 1mb = 1048576 bytes
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/(image\/)*$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
};
