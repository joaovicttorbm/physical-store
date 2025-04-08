import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { logger } from './winston.logger';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;

      const logMessage = {
        method,
        url: originalUrl,
        statusCode,
        duration: `${duration}ms`,
        success: statusCode >= 200 && statusCode < 300,
      };

      if (statusCode >= 500) {
        logger.error('Request failed', logMessage);
      } else if (statusCode >= 400) {
        logger.warn('Client error', logMessage);
      } else {
        logger.info('Request successful', logMessage);
      }
    });

    next();
  }
}