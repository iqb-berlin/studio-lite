import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse
} from '@angular/common/http';
import {
  finalize, Observable, throwError, BehaviorSubject, filter, take, switchMap, catchError, tap
} from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { AppHttpError } from '../classes/app-http-error.class';

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

    const isBackgroundRequest = req.url.includes('/ping') ||
                                req.url.includes('/refresh') ||
                                req.url.includes('/activity') ||
                                req.url.includes('/logout');

    return next.handle(this.addToken(req, idToken))
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            const serverDate = event.headers.get('Date');
            if (serverDate) {
              this.appService.serverTimeOffset = new Date(serverDate).getTime() - Date.now();
            }
          }
        }),
        catchError(error => {
          if (error.status === 401 &&
              !req.url.includes('login') &&
              !req.url.includes('refresh') &&
              !req.url.includes('logout')) {
            return this.handle401Error(req, next);
          }
          httpErrorInfo = new AppHttpError(error);
          return throwError(() => error);
        }),
        finalize(() => {
          if (httpErrorInfo) {
            // Suppress error alerts for background pings/refreshes if they fail with 401
            // This happens naturally when a session expires
            if (isBackgroundRequest && httpErrorInfo.status === 401) {
              return;
            }
            httpErrorInfo.method = req.method;
            httpErrorInfo.urlWithParams = req.urlWithParams;
            this.appService.addErrorMessage(httpErrorInfo);
          }
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
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        return this.backendService.refresh(refreshToken).pipe(
          switchMap(tokenData => {
            this.isRefreshing = false;
            if (tokenData) {
              const { accessToken, refreshToken: newRefreshToken } = tokenData;
              localStorage.setItem('id_token', accessToken);
              localStorage.setItem('refresh_token', newRefreshToken);
              this.refreshTokenSubject.next(accessToken);

              return next.handle(this.addToken(request, accessToken));
            }
            this.backendService.logout();
            this.router.navigate(['/home']);
            return throwError(() => new Error('Refresh failed'));
          }),
          catchError(err => {
            this.isRefreshing = false;
            this.backendService.logout();
            this.router.navigate(['/home']);
            return throwError(() => err);
          })
        );
      }
      // Safety: if no refresh token, logout and reset state
      this.isRefreshing = false;
      this.backendService.logout();
      this.router.navigate(['/home']);
      const error = new Error('No refresh token available') as Error & { status?: number };
      error.status = 401; // Marker for finalize to suppress background alert
      return throwError(() => error);
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(jwt => next.handle(this.addToken(request, jwt)))
    );
  }
}
