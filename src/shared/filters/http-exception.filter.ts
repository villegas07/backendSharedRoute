import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain.exception';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const { status, message, code } = this.resolveException(exception);

    this.logger.error(
      `${request.method} ${request.url} → ${status} ${code}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      success: false,
    });
  }

  private resolveException(exception: unknown): {
    status: number;
    message: string;
    code: string;
  } {
    if (exception instanceof HttpException) {
      return { status: exception.getStatus(), message: exception.message, code: 'HTTP_EXCEPTION' };
    }

    if (exception instanceof DomainException) {
      return {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        message: exception.message,
        code: exception.code,
      };
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error', code: 'INTERNAL_ERROR' };
  }
}
