import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse
} from '@angular/common/http';
import {
  finalize, Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError, tap, fromEvent, timeout,
  map, of
} from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { AppHttpError } from '../classes/app-http-error.class';
import { SERVER_TIME_OFFSET_DEADBAND_MS } from '../app.constants';
import { IS_BACKGROUND_REQUEST, SKIP_TOKEN_REFRESH } from './request-classification';

/**
 * Everything that happens to every request on its way out and back: the bearer token and the app
 * version go on it, a 401 is answered by refreshing the token once and repeating the request, and a
 * failure that is nobody's doing is kept out of the error messages.
 *
 * Which of those a request wants is declared at the call site through the contexts in
 * `request-classification.ts`, not guessed from its URL.
 *
 * The server's `Date` header is read along the way and becomes the clock skew every time-based
 * decision in the frontend is then measured against.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    @Inject('APP_VERSION') readonly appVersion: string,
    private appService: AppService,
    private backendService: BackendService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const idToken = localStorage.getItem('id_token');
    let httpErrorInfo: AppHttpError | null = null;

    const isBackgroundRequest = req.context.get(IS_BACKGROUND_REQUEST);

    return next.handle(this.addToken(req, idToken))
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            const serverDate = event.headers.get('Date');
            if (serverDate) {
              const measuredOffset = new Date(serverDate).getTime() - Date.now();
              // The Date header only has second resolution; changes within the
              // deadband are measurement jitter, not real clock skew.
              if (Math.abs(measuredOffset - this.appService.serverTimeOffset) > SERVER_TIME_OFFSET_DEADBAND_MS) {
                this.appService.serverTimeOffset = measuredOffset;
              }
            }
          }
        }),
        catchError(error => {
          if (error.status === 401 && !req.context.get(SKIP_TOKEN_REFRESH)) {
            return this.handle401Error(req, next, idToken);
          }
          httpErrorInfo = new AppHttpError(error);
          return throwError(() => error);
        }),
        finalize(() => {
          if (httpErrorInfo) {
            // Suppress error alerts for background refreshes/activity syncs if they fail with 401
            // This happens naturally when a session expires
            if (isBackgroundRequest && httpErrorInfo.status === 401) {
              return;
            }
            this.report(req, httpErrorInfo);
          }
        })
      );
  }

  private report(request: HttpRequest<unknown>, httpErrorInfo: AppHttpError): void {
    httpErrorInfo.method = request.method;
    httpErrorInfo.urlWithParams = request.urlWithParams;
    this.appService.addErrorMessage(httpErrorInfo);
  }

  /**
   * Sends a request again under a renewed token. Its failure has to be reported here: the
   * repetition replaces the original stream, so the catchError in intercept() never sees it.
   *
   * A 401 that survives a fresh token cannot mean "not logged in" -- the session was renewed a
   * moment ago. It is what the API still answers for a workspace the user has no access to, and
   * is shown as the missing permission it is (#1694). The caller gets the original error.
   */
  private repeat(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    token: string
  ): Observable<HttpEvent<unknown>> {
    return next.handle(this.addToken(request, token)).pipe(
      catchError(error => {
        const httpErrorInfo = new AppHttpError(error);
        if (httpErrorInfo.status === 401) {
          httpErrorInfo.status = 403;
        }
        this.report(request, httpErrorInfo);
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    return request.clone({
      setHeaders: token ? {
        Authorization: `Bearer ${token}`,
        'app-version': this.appVersion
      } : {
        'app-version': this.appVersion
      }
    });
  }

  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler,
    failedToken: string | null
  ): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap(jwt => this.repeat(request, next, jwt))
      );
    }

    const lockTime = parseInt(localStorage.getItem('st_refresh_lock') || '0', 10);
    const isLocked = lockTime && (Date.now() - lockTime < 5000);
    const currentToken = localStorage.getItem('id_token');

    if (isLocked) {
      if (currentToken && currentToken !== failedToken) {
        // Another tab refreshed it just now. Retry immediately.
        return this.repeat(request, next, currentToken);
      }

      // Wait for another tab to finish refreshing. If it times out or brings no token, refresh
      // ourselves. That fallback covers the waiting only: were it to sit behind the repetition,
      // a request failing for its own reason would set off a second refresh (#1694).
      return fromEvent<StorageEvent>(window, 'storage').pipe(
        filter(event => event.key === 'id_token'),
        take(1),
        timeout({
          each: 5000,
          with: () => throwError(() => new Error('Storage event timeout'))
        }),
        map(event => event.newValue),
        catchError(() => of(null)),
        switchMap(newToken => (newToken ?
          this.repeat(request, next, newToken) :
          this.performRefresh(request, next)))
      );
    }

    return this.performRefresh(request, next);
  }

  private performRefresh(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
    localStorage.setItem('st_refresh_lock', Date.now().toString());

    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      return this.backendService.refresh(refreshToken).pipe(
        // Only a failed refresh ends the session, so this catchError has to stay in front of the
        // switchMap. Behind it, it also caught the repeated request: when that failed too -- as it
        // does for a workspace the user has no access to, which the API also answers with 401 --
        // a session that had just been renewed was logged out (#1694).
        catchError(err => {
          this.isRefreshing = false;
          localStorage.removeItem('st_refresh_lock');
          this.backendService.logout();
          this.router.navigate(['/home']);
          return throwError(() => err);
        }),
        switchMap(tokenData => {
          this.isRefreshing = false;
          localStorage.removeItem('st_refresh_lock');
          if (tokenData) {
            const { accessToken, refreshToken: newRefreshToken } = tokenData;
            localStorage.setItem('id_token', accessToken);
            localStorage.setItem('refresh_token', newRefreshToken);
            this.refreshTokenSubject.next(accessToken);

            return this.repeat(request, next, accessToken);
          }
          this.backendService.logout();
          this.router.navigate(['/home']);
          return throwError(() => new Error('Refresh failed'));
        })
      );
    }

    // Safety fallback: if no refresh token
    this.isRefreshing = false;
    localStorage.removeItem('st_refresh_lock');
    this.backendService.logout();
    this.router.navigate(['/home']);
    const error = new Error('No refresh token available') as Error & { status?: number };
    error.status = 401;
    return throwError(() => error);
  }
}
