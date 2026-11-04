import { HttpErrorResponse } from '@angular/common/http';
import {
  catchError, map, Observable, of
} from 'rxjs';
import { SESSION_ENDED_MESSAGE } from '@studio-lite/shared-code';

// FileReader rather than Blob.text(): the jsdom the unit tests run in has no Blob.text().
function readText(blob: Blob): Observable<string> {
  return new Observable<string>(subscriber => {
    const reader = new FileReader();
    reader.onload = () => {
      subscriber.next(typeof reader.result === 'string' ? reader.result : '');
      subscriber.complete();
    };
    reader.onerror = () => subscriber.error(reader.error);
    reader.readAsText(blob);
  });
}

function namesSessionEnded(body: string): boolean {
  try {
    return JSON.parse(body)?.message === SESSION_ENDED_MESSAGE;
  } catch {
    return false;
  }
}

/**
 * Whether the server refused the token because its session has ended -- a new password, a logout
 * elsewhere (#2115) -- rather than because it expired. A request that expects a file gets the
 * answer as a Blob, which has to be read first, so the answer comes as an observable.
 */
export function isSessionEnded(error: HttpErrorResponse): Observable<boolean> {
  if (error.status !== 401) return of(false);
  const body: unknown = error.error;
  if (body instanceof Blob) {
    return readText(body).pipe(
      map(namesSessionEnded),
      catchError(() => of(false))
    );
  }
  return of((body as { message?: unknown } | null)?.message === SESSION_ENDED_MESSAGE);
}
