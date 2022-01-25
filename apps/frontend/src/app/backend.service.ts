// eslint-disable-next-line max-classes-per-file
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {ChangePasswordDto, ConfigFullDto} from "@studio-lite-lib/api-dto";

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
    private http: HttpClient
  ) { }

  private static transformWorkspaceData(workspaceList: WorkspaceData[]): WorkspaceGroupData[] {
    const collectedData: {
      [key: string]: WorkspaceGroupData;
    } = {};
    workspaceList.forEach(ws => {
      if (!collectedData[ws.ws_group_id]) {
        collectedData[ws.ws_group_id] = <WorkspaceGroupData>{
          id: ws.ws_group_id,
          name: ws.ws_group_name,
          workspaces: []
        };
      }
      collectedData[ws.ws_group_id].workspaces.push(ws);
    });
    return Object.values(collectedData);
  }

  private getWorkspaceList(loginStatusResponseData: LoginStatusResponseData): Observable<LoginData> {
    localStorage.setItem('t', loginStatusResponseData.token);
    return this.http
      .put<WorkspaceData[]>(`${this.serverUrl}php_authoring/getWorkspaceList.php`, { t: loginStatusResponseData.token })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          localStorage.removeItem('t');
          return throwError(new AppHttpError(err));
        }),
        switchMap(workspaceList => {
          if (workspaceList.length > 1) {
            workspaceList.sort((ws1, ws2) => {
              if (ws1.name.toLowerCase() > ws2.name.toLowerCase()) {
                return 1;
              }
              if (ws1.name.toLowerCase() < ws2.name.toLowerCase()) {
                return -1;
              }
              return 0;
            });
          }
          return of(<LoginData>{
            name: loginStatusResponseData.name,
            isSuperAdmin: loginStatusResponseData.is_superadmin,
            workspaces: workspaceList,
            workspacesGrouped: BackendService.transformWorkspaceData(workspaceList)
          });
        })
      );
  }

  getStatus(): Observable<LoginData> {
    const storageEntry = localStorage.getItem('t');
    if (storageEntry === null) {
      const appError = new AppHttpError();
      appError.code = 401;
      appError.info = 'Bitte anmelden!';
      return throwError(appError);
    }
    return this.http
      .put<LoginStatusResponseData>(`${this.serverUrl}getStatus.php`, { t: storageEntry })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          localStorage.removeItem('t');
          return throwError(new AppHttpError(err));
        }),
        switchMap(authData => this.getWorkspaceList(authData))
      );
  }

  getConfig(): Observable<ConfigFullDto | null> {
    return this.http
      .get<ConfigFullDto | null>(`${this.serverUrl}admin/config`, {})
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

export interface LoginStatusResponseData {
  token: string;
  name: string;
  is_superadmin: boolean;
}

export interface WorkspaceData {
  id: number;
  name: string;
  ws_group_id: number;
  ws_group_name: string;
}

export interface WorkspaceGroupData {
  id: number;
  name: string;
  workspaces: WorkspaceData[];
}

export interface LoginData {
  name: string;
  isSuperAdmin: boolean;
  workspaces: WorkspaceData[];
  workspacesGrouped: WorkspaceGroupData[];
}

export class AppConfig {
  readonly appTitle: string;
  readonly introHtml: SafeUrl | undefined;
  readonly imprintHtml: SafeUrl | undefined;
  private readonly _globalWarningText: string;
  private readonly _globalWarningExpiredDay: Date | undefined;
  private readonly _globalWarningExpiredHour: number | undefined;

  constructor(appConfig: ConfigFullDto, sanitizer: DomSanitizer) {
    this.appTitle = appConfig.appTitle;
    if (appConfig.introHtml) this.introHtml = sanitizer.bypassSecurityTrustHtml(appConfig.introHtml);
    if (appConfig.imprintHtml) this.imprintHtml = sanitizer.bypassSecurityTrustHtml(appConfig.imprintHtml);
    this._globalWarningText = appConfig.globalWarningText;
    this._globalWarningExpiredDay = appConfig.globalWarningExpiredDay;
    this._globalWarningExpiredHour = appConfig.globalWarningExpiredHour;
  }

  public static isExpired(checkDate: Date | undefined, checkHour: number | undefined): boolean {
    if (checkDate) {
      const calcTimePoint = new Date(checkDate);
      calcTimePoint.setHours(calcTimePoint.getHours() + Number(checkHour ? checkHour : 0));
      const now = new Date(Date.now());
      return calcTimePoint < now;
    }
    return false
  }

  public globalWarningText(): string {
    return this._globalWarningText && this._globalWarningExpiredDay &&
      AppConfig.isExpired(this._globalWarningExpiredDay, this._globalWarningExpiredHour) ? this._globalWarningText : '';
  }
}
