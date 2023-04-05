import { Inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpHeaders
} from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { AppHttpError } from './app.classes';
import { AppService } from './services/app.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    @Inject('APP_VERSION') readonly appVersion: string,
    private appService: AppService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const idToken = localStorage.getItem('id_token');
    const headers = idToken ? new HttpHeaders({
      Authorization: `Bearer ${idToken}`,
      'app-version': this.appVersion
    }) : new HttpHeaders({
      'app-version': this.appVersion
    });
    let httpErrorInfo: AppHttpError | null = null;
    return next.handle(req.clone({ headers }))
      .pipe(
        tap({
          error: error => {
            httpErrorInfo = new AppHttpError(error);
          }
        }),
        finalize(() => {
          if (httpErrorInfo) {
            httpErrorInfo.method = req.method;
            httpErrorInfo.urlWithParams = req.urlWithParams;
            this.appService.addErrorMessage(httpErrorInfo);
          }
        })
      );
  }
}
