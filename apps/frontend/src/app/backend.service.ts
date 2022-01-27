// eslint-disable-next-line max-classes-per-file
import { Injectable, Inject } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthDataDto, ChangePasswordDto, ConfigFullDto} from "@studio-lite-lib/api-dto";
import {AppService} from "./app.service";

export class AppHttpError {
  code: number | undefined;
  info: string | undefined;
  constructor(errorObj?: HttpErrorResponse) {
    if (errorObj) {
      this.code = errorObj.status;
      this.info = errorObj.message;
      if (errorObj.status === 401) {
        this.info = 'Zugriff verweigert - bitte (neu) anmelden!';
      } else if (errorObj.status === 503) {
        this.info = 'Server meldet Datenbankproblem.';
      } else if (errorObj.error instanceof ErrorEvent) {
        this.info = `Fehler: ${(<ErrorEvent>errorObj.error).message}`;
      }
    }
  }

  msg(): string {
    return `${this.info} (Fehler ${this.code})`;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private appService: AppService,
    private http: HttpClient
  ) { }

  login(name: string, password: string) {
    const queryParams = new HttpParams()
      .set('username', name)
      .set('password', password);
    return this.http.post<string>(`${this.serverUrl}login?${queryParams.toString()}`, 'jojo')
      .pipe(
        switchMap(loginToken => {
          localStorage.setItem("id_token", loginToken);
          return this.getAuthData()
            .pipe(
              map(authData => {
                this.appService.authData = authData;
                return
              })
            );
        })
      )
  }

  getAuthData(): Observable<AuthDataDto> {
    return this.http.get<AuthDataDto>(`${this.serverUrl}auth-data`)
  }

  logout(): void {
    localStorage.removeItem("id_token");
    this.appService.authData = AppService.defaultAuthData;
  }

  getConfig(): Observable<ConfigFullDto | null> {
    return this.http
      .get<ConfigFullDto | null>(`${this.serverUrl}admin/settings/config`, {})
      .pipe(
        catchError(() => of(null))
      );
  }

  setUserPassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}password`, <ChangePasswordDto>{
        oldPassword: oldPassword, newPassword: newPassword})
      .pipe(
        catchError(() => of(false))
      );
  }
}
