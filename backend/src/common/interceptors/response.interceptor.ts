import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpStatusMessages } from '../utils/http-status-messages.util';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    return next.handle().pipe(
      map(data => {
        const statusCode = response.statusCode;
        const message = HttpStatusMessages[statusCode] || 'Success';

        return {
          statusCode,
          message,
          data,
        };
      }),
    );
  }
}
