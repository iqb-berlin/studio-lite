import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { AppHttpError } from './app.classes';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private appService: AppService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const idToken = localStorage.getItem('id_token');
    let httpErrorInfo: AppHttpError | null = null;
    return next.handle(idToken ? req.clone({
      headers: req.headers.set('Authorization',
        `Bearer ${idToken}`)
    }) : req)
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
