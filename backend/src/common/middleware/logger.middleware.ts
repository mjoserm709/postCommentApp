import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

type RequestUser = {
  userId?: string;
  username?: string;
};

type RequestWithContext = Request & {
  requestId?: string;
  user?: RequestUser;
};

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: RequestWithContext, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const startAt = Date.now();
    const requestId = request.headers['x-request-id']?.toString() || randomUUID();
    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const timeMs = Date.now() - startAt;
      const actor = request.user?.userId ?? 'anonymous';
      const username = request.user?.username ?? 'guest';

      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength ?? 0} - ${username}/${actor} - ${userAgent} ${ip} - ${timeMs}ms`
      );
    });

    next();
  }
}
