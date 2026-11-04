import { Observable, OperatorFunction, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Reduces a request whose answer the caller does not need to whether it succeeded: `true` for
 * every answer, `false` instead of an error. The backend services hand their callers this
 * yes or no, and the callers show the message that goes with it.
 */
export function succeeded<T>(): OperatorFunction<T, boolean> {
  return (source: Observable<T>) => source.pipe(
    map(() => true),
    catchError(() => of(false))
  );
}
