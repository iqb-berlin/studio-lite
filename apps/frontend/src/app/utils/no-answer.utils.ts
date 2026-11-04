import { HttpErrorResponse } from '@angular/common/http';

/**
 * Whether a status stands for a failure without an answer -- no connection, or an error of the
 * server or of a proxy in front of it -- rather than for a verdict of the server. Such a failure says
 * nothing about the login, so the studio must not treat its user as logged out (#2112).
 *
 * 999 is how `AppHttpError` reports a request that never reached the server. 521 is left out: the
 * server sends it when the frontend is older than the API, and only a reload helps there, which the
 * error message already asks for.
 */
export function isNoAnswerStatus(status: number): boolean {
  return status === 0 || status === 999 || (status >= 500 && status < 600 && status !== 521);
}

export function isNoAnswer(error: unknown): boolean {
  return error instanceof HttpErrorResponse && isNoAnswerStatus(error.status);
}
