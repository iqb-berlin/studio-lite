import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  AuthDataDto,
  ChangePasswordDto,
  ConfigDto,
  AppLogoDto,
  MyDataDto,
  WorkspaceFullDto,
  WorkspaceSettingsDto,
  ResourcePackageDto,
  UserWorkspaceFullDto,
  EmailTemplateDto
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
  ) {
  }

  login(name: string, password: string, initLoginMode: boolean): Observable<boolean> {
    return this.http.post<string>(
      `${this.serverUrl}${initLoginMode ? 'init-login' : 'login'}`, {
        username: name,
        password: password
      }
    )
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

  getMyData(): Observable<MyDataDto | null> {
    return this.http.get<MyDataDto>(`${this.serverUrl}my-data`)
      .pipe(
        catchError(() => of(null))
      );
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

  getResourcePackages(): Observable<ResourcePackageDto[]> {
    return this.http
      .get<ResourcePackageDto[]>(`${this.serverUrl}resource-packages`, {})
      .pipe(
        catchError(() => of([]))
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

  getWorkspaceData(workspaceId: number): Observable<WorkspaceFullDto | null> {
    return this.http
      .get<WorkspaceFullDto>(
      `${this.serverUrl}workspaces/${workspaceId}`
    )
      .pipe(
        catchError(() => of(null))
      );
  }

  getUserWorkspaceData(workspaceId: number, userId: number): Observable<UserWorkspaceFullDto | null> {
    return this.http
      .get<UserWorkspaceFullDto>(
      `${this.serverUrl}workspaces/${workspaceId}/users/${userId}`
    )
      .pipe(
        catchError(() => of(null))
      );
  }

  setWorkspaceSettings(workspaceId: number, settings: WorkspaceSettingsDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/settings`, settings)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getEmailTemplate(): Observable<EmailTemplateDto> {
    return this.http
      .get<EmailTemplateDto>(`${this.serverUrl}admin/settings/email-template`);
  }

  setEmailTemplate(emailTemplateDto: EmailTemplateDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/email-template`, emailTemplateDto)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }
}
