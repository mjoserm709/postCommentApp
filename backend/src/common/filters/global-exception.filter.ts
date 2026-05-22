import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../responses/api-response';
import { HttpStatusMessages } from '../utils/http-status-messages.util';

type RequestWithContext = Request & {
  requestId?: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithContext>();

    const { status, message, errorCode, details } = this.normalizeException(exception);

    response.status(status).json(
      ApiResponse.error(message, {
        code: errorCode,
        details: {
          path: request.url,
          method: request.method,
          requestId: request.requestId,
          timestamp: new Date().toISOString(),
          ...details,
        },
      }),
    );
  }

  private normalizeException(exception: unknown) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        return {
          status,
          message: exceptionResponse,
          errorCode: HttpStatusMessages[status] || 'HTTP_ERROR',
          details: undefined,
        };
      }

      if (exceptionResponse && typeof exceptionResponse === 'object') {
        const payload = exceptionResponse as Record<string, unknown>;
        const rawMessage = payload.message ?? exception.message;
        const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : String(rawMessage);

        return {
          status,
          message,
          errorCode: String(payload.error ?? HttpStatusMessages[status] ?? 'HTTP_ERROR'),
          details: Array.isArray(rawMessage) ? { validationErrors: rawMessage } : undefined,
        };
      }
    }

    if (exception instanceof mongoose.Error.ValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Mongo validation error',
        errorCode: 'MONGO_VALIDATION_ERROR',
        details: Object.values(exception.errors).map((error) => error.message),
      };
    }

    if (exception instanceof mongoose.Error.CastError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `Invalid ${exception.path}`,
        errorCode: 'MONGO_CAST_ERROR',
        details: { value: exception.value },
      };
    }

    if (this.isMongoDuplicateKeyError(exception)) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'Duplicate key error',
        errorCode: 'MONGO_DUPLICATE_KEY',
        details: exception.keyValue,
      };
    }

    if (exception instanceof Error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal Server Error',
        errorCode: 'INTERNAL_SERVER_ERROR',
        details: undefined,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
      errorCode: 'INTERNAL_SERVER_ERROR',
      details: undefined,
    };
  }

  private isMongoDuplicateKeyError(
    exception: unknown,
  ): exception is { code: number; keyValue?: Record<string, unknown> } {
    return Boolean(
      exception &&
        typeof exception === 'object' &&
        'code' in exception &&
        (exception as { code?: unknown }).code === 11000,
    );
  }
}
