import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();
    const errorTime = new Date().toLocaleString();

    // Handle non-HttpException errors or Internal Server Errors
    if (!(exception instanceof HttpException)) {
      const errorMsg = `[${request.method}] ${request.url} ${HttpStatus.INTERNAL_SERVER_ERROR} - ${exception} - ${errorTime}`;
      this.logger.error(errorMsg);
      this.logger.error(exception.stack);

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        path: request.url,
        timestamp,
      });
    }

    // Handle HttpException
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Format the error message
    let message = 'Internal server error';
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      let responseMessage = (
        exceptionResponse as { message: string | string[] }
      ).message;
      // Handle array of messages (validation errors)
      message = Array.isArray(responseMessage)
        ? responseMessage[0]
        : responseMessage;
    }

    // Log the error
    const httpErrorMsg = `[${request.method}] ${request.url} ${status} - ${message} - ${errorTime}`;
    this.logger.error(httpErrorMsg);

    // Return formatted response
    return response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp,
      ...(process.env.NODE_ENV === 'development' && { stack: exception.stack }),
    });
  }
}
