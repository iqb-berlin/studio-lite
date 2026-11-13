import {
  BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { isValueTooLong } from '../utils/column-length';

/**
 * Answers a value longer than its column with 400 rather than 500 (#2133). The database refuses
 * such a value, and its error reached the user as a server problem, although the request, not the
 * server, was at fault. Only this one error is turned; every other passes through unchanged, so
 * that a 5xx keeps meaning that the server failed. The frontend tells the two apart: it keeps a
 * session over a 5xx and ends it over anything else, but no route of the token refresh writes a
 * value whose length the client chooses.
 */
@Injectable()
export class ValueTooLongInterceptor implements NestInterceptor {
  // eslint-disable-next-line class-methods-use-this
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError(error => throwError(() => (isValueTooLong(error) ?
        new BadRequestException(`A value is longer than its column allows: ${error.message}`) :
        error)))
    );
  }
}
