import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpStatusMessages } from '../utils/http-status-messages.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    let customMessage = 'Internal Server Error';
    if (exceptionResponse && typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
      customMessage = (exceptionResponse as any).message;
      if (Array.isArray(customMessage)) {
        customMessage = customMessage.join(', ');
      }
    } else if (typeof exceptionResponse === 'string') {
      customMessage = exceptionResponse;
    } else if (exception instanceof Error) {
      customMessage = exception.message;
    }

    const reasonText = HttpStatusMessages[status] || 'Unknown Error';
    
    // Extract service from URL (e.g., /api/users -> users)
    const urlParts = request.url.split('/').filter(Boolean);
    const serviceName = urlParts.length > 0 ? urlParts[0].toUpperCase() : 'API';

    response.status(status).json({
      reason: reasonText,
      code: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message: customMessage,
      service: serviceName,
    });
  }
}
