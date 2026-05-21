import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../responses/api-response';
import { HttpStatusMessages } from '../utils/http-status-messages.util';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ReturnType<typeof ApiResponse.success<T>>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ReturnType<typeof ApiResponse.success<T>>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    return next.handle().pipe(
      map(data => {
        const statusCode = response.statusCode;
        const message = HttpStatusMessages[statusCode] || 'Success';
        return ApiResponse.success(message, data);
      }),
    );
  }
}
