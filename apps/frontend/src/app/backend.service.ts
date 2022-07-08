import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  AuthDataDto, ChangePasswordDto, ConfigDto, AppLogoDto, MyDataDto, VeronaModuleInListDto
} from '@studio-lite-lib/api-dto';
import { AppService, defaultAppConfig } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private appService: AppService,
    private http: HttpClient
  ) { }

  login(name: string, password: string): Observable<boolean> {
    const queryParams = new HttpParams()
      .set('username', name)
      .set('password', password);
    return this.http.post<string>(`${this.serverUrl}login?${queryParams.toString()}`, 'jojo')
      .pipe(
        catchError(() => of(false)),
        switchMap(loginToken => {
          if (typeof loginToken === 'string') {
            localStorage.setItem('id_token', loginToken);
            return this.getAuthData()
              .pipe(
                map(authData => {
                  this.appService.authData = authData;
                  return true;
                }),
                catchError(() => of(false))
              );
          }
          return of(loginToken);
        })
      );
  }

  getAuthData(): Observable<AuthDataDto> {
    return this.http.get<AuthDataDto>(`${this.serverUrl}auth-data`);
  }

  getMyData(): Observable<MyDataDto> {
    return this.http.get<MyDataDto>(`${this.serverUrl}my-data`);
  }

  setMyData(newMyData: MyDataDto): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}my-data`, newMyData)
      .pipe(
        catchError(() => of(false))
      );
  }

  logout(): void {
    localStorage.removeItem('id_token');
    this.appService.authData = AppService.defaultAuthData;
  }

  getConfig(): Observable<ConfigDto | null> {
    return this.http
      .get<ConfigDto | null>(`${this.serverUrl}admin/settings/config`, {})
      .pipe(
        catchError(() => of(defaultAppConfig))
      );
  }

  getAppLogo(): Observable<AppLogoDto | null> {
    return this.http
      .get<AppLogoDto | null>(`${this.serverUrl}admin/settings/app-logo`, {})
      .pipe(
        catchError(() => of(null))
      );
  }

  setUserPassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.http
      .patch<boolean>(
      `${this.serverUrl}password`,
        <ChangePasswordDto>{ oldPassword: oldPassword, newPassword: newPassword }
    )
      .pipe(
        catchError(() => of(false))
      );
  }

  getModuleList(type: string): Observable<VeronaModuleInListDto[]> {
    return this.http
      .get<VeronaModuleInListDto[]>(`${this.serverUrl}admin/verona-modules/${type}`)
      .pipe(
        catchError(() => of([]))
      );
  }
}
