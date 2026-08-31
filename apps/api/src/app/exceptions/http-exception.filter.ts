import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Gives every HTTP error the same body: status, message, the endpoint that produced it, a
 * timestamp, and under `custom` whatever the exception itself carried. The exceptions in this
 * directory put controller, method and the offending id there, so a report from the field says
 * which route failed on which record.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  /** Logs the failure at warn level and writes the response body described on the class. */
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const message = exception.message || null;
    const custom = exception.getResponse();

    this.logger.warn(`${statusCode} ${message}`);

    response
      .status(statusCode)
      .json({
        statusCode,
        message,
        custom,
        timestamp: new Date().toISOString(),
        endpoint: request.url
      });
  }
}
