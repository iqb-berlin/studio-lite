import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  AuthDataDto,
  ChangePasswordDto,
  ConfigDto,
  AppLogoDto,
  EffectsDto,
  MyDataDto,
  WorkspaceFullDto,
  WorkspaceSettingsDto,
  ResourcePackageDto,
  UserWorkspaceFullDto,
  EmailTemplateDto
} from '@studio-lite-lib/api-dto';
import { ResourcePackageChoice } from '@studio-lite/shared-code';
import { AppService, defaultAppConfig } from './app.service';
import {
  authRequestContext, backgroundRequestContext, logoutContext, tokenRefreshContext
} from '../interceptors/request-classification';
import { succeeded } from '../utils/succeeded.utils';
import { isNoAnswer } from '../utils/no-answer.utils';
import { withTrimmedEmail } from '../utils/email.utils';
import { randomSessionId } from '../utils/session-id.utils';

/**
 * The API calls that belong to no single area: logging in and out, the token refresh, the user's own
 * data and password, the installation's config and logo, and the activity report.
 *
 * Each module has a backend service of its own for its own routes; what is here is what the shell
 * of the application needs.
 */
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private static readonly newSessionIdKey = 'new_session_id';

  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private appService: AppService,
    private http: HttpClient
  ) {
  }

  login(name: string, password: string, initLoginMode: boolean): Observable<boolean> {
    const sessionId = BackendService.getSessionIdFromToken();
    const newSessionId = BackendService.getNewSessionId();
    return this.http.post<{ accessToken: string, refreshToken: string }>(
      `${this.serverUrl}${initLoginMode ? 'init-login' : 'login'}`,
      {
        username: name,
        password: password,
        sessionId,
        newSessionId
      },
      { context: authRequestContext() }
    )
      .pipe(
        catchError(() => of(false)),
        switchMap(loginData => {
          if (loginData && typeof loginData === 'object') {
            const { accessToken, refreshToken } = loginData as {
              accessToken: string,
              refreshToken: string
            };
            localStorage.setItem('id_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);
            // Another tab may have replaced the id while this answer was on its way.
            if (BackendService.getSessionIdFromToken(accessToken) === newSessionId &&
              localStorage.getItem(BackendService.newSessionIdKey) === newSessionId) {
              localStorage.removeItem(BackendService.newSessionIdKey);
            }
            return this.getAuthData()
              .pipe(
                map(authData => {
                  this.appService.authData = authData;
                  return true;
                }),
                catchError(() => of(false))
              );
          }
          return of(false);
        })
      );
  }

  /**
   * Answers null when the server has refused the token: the session cannot be continued. A failure
   * without an answer -- no connection, or an error of the server -- says nothing about the session
   * and is passed on, so that a network outage does not log out a browser whose session is fine
   * (#2110). The start page draws the same line for the check of a stored login (#2112).
   */
  refresh(refreshToken: string): Observable<{ accessToken: string, refreshToken: string } | null> {
    return this.http.post<{ accessToken: string, refreshToken: string }>(
      `${this.serverUrl}refresh`,
      { refreshToken },
      { context: tokenRefreshContext() }
    ).pipe(
      catchError(error => (isNoAnswer(error) ? throwError(() => error) : of(null)))
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
      .patch<boolean>(`${this.serverUrl}my-data`, withTrimmedEmail(newMyData))
      .pipe(
        catchError(() => of(false))
      );
  }

  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.http.post(`${this.serverUrl}logout`, { refreshToken }, { context: logoutContext() }).subscribe({
        error: () => {
          // If JWT is expired, try silent logout with refresh token
          this.http
            .post(`${this.serverUrl}logout-silent`, { refreshToken }, { context: logoutContext() })
            .subscribe();
        }
      });
    } else {
      this.http.post(`${this.serverUrl}logout`, {}, { context: logoutContext() }).subscribe();
    }
    localStorage.removeItem('id_token');
    localStorage.removeItem('refresh_token');
    this.appService.authData = AppService.defaultAuthData;
  }

  getConfig(): Observable<ConfigDto | null> {
    return this.http
      .get<ConfigDto | null>(`${this.serverUrl}settings/config`, {})
      .pipe(
        catchError(() => of(defaultAppConfig))
      );
  }

  // A failure answers false, not null: null means that no logo is stored, and the admin form must
  // not offer an empty logo for saving over one it could not load (#1969).
  getAppLogo(): Observable<AppLogoDto | null | false> {
    return this.http
      .get<AppLogoDto | null>(`${this.serverUrl}settings/app-logo`, {})
      .pipe(
        catchError(() => of(false as const))
      );
  }

  // A failure answers null: the start page then shows no snow, and the admin form says it could not load.
  getEffects(): Observable<EffectsDto | null> {
    return this.http
      .get<EffectsDto>(`${this.serverUrl}settings/effects`, {})
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

  /** The default package per package name (#1358); none when they could not be read. */
  getResourcePackageDefaults(): Observable<ResourcePackageChoice> {
    return this.http
      .get<ResourcePackageChoice>(`${this.serverUrl}resource-packages/defaults`)
      .pipe(
        catchError(() => of({}))
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
      .pipe(succeeded());
  }

  // Without a stored template the API answers an empty one, so null means only that the load failed: the admin
  // card says so instead of showing empty fields, and the user dialog offers no mail (#2188).
  getEmailTemplate(): Observable<EmailTemplateDto | null> {
    return this.http
      .get<EmailTemplateDto>(`${this.serverUrl}settings/email-template`)
      .pipe(
        catchError(() => of(null))
      );
  }

  setEmailTemplate(emailTemplateDto: EmailTemplateDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}settings/email-template`, emailTemplateDto)
      .pipe(succeeded());
  }

  activity(): Observable<void> {
    return this.http.post<void>(`${this.serverUrl}activity`, {}, { context: backgroundRequestContext() });
  }

  /**
   * The id for the session a login opens, kept in the storage until a token names it. The server
   * may open the session and its answer never arrive -- the page reloaded, the tab closed. The next
   * login sends the same id and continues that session instead of leaving it behind (#2151).
   *
   * A login that does not open the session under it keeps it: a refused one, a review login, one
   * that continued the session of the stored token, and one whose id another account holds -- the
   * session a lost login opened under it may be another person's on the same browser profile, and
   * stays theirs to continue. Once a token names the id, the session's id is in the token, and the
   * next login without one gets a new id.
   */
  private static getNewSessionId(): string {
    const storedId = localStorage.getItem(BackendService.newSessionIdKey);
    if (storedId) return storedId;
    const newId = randomSessionId();
    localStorage.setItem(BackendService.newSessionIdKey, newId);
    return newId;
  }

  private static getSessionIdFromToken(token: string | null = localStorage.getItem('id_token')): string | undefined {
    if (!token) return undefined;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );
      return (JSON.parse(jsonPayload) as { sid: string }).sid;
    } catch {
      return undefined;
    }
  }
}
