import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppConfig, AppHttpError } from '../backend.service';
import {ConfigFullDto, UserInListDto, WorkspaceInListDto} from "@studio-lite-lib/api-admin";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getUsers(): Observable<UserInListDto[]> {
    return this.http
      .get<UserInListDto[]>(`${this.serverUrl}admin/users`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addUser(name: string, password: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}addUser.php`, { t: localStorage.getItem('t'), n: name, p: password })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  changePassword(name: string, password: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}setPassword.php`,
      { t: localStorage.getItem('t'), n: name, p: password })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setSuperUserStatus(userId: number, changeToSuperUser: boolean, password: string): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}setSuperAdminStatus.php`, {
      t: localStorage.getItem('t'), u: userId, s: changeToSuperUser ? 'true' : 'false', p: password
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  deleteUsers(users: string[]): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}deleteUsers.php`, { t: localStorage.getItem('t'), u: users })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getWorkspacesByUser(userId: number): Observable<WorkspaceInListDto[]> {
    return this.http
      .get<WorkspaceInListDto[]>(`${this.serverUrl}admin/users/${userId}/workspaces`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setWorkspacesByUser(user: number, accessTo: WorkspaceInListDto[]): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}setUserWorkspaces.php`,
      { t: localStorage.getItem('t'), u: user, w: accessTo })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getWorkspaces(): Observable<WorkspaceData[]> {
    return this.http
      .post<WorkspaceData[]>(`${this.serverUrl}getWorkspaces.php`, { t: localStorage.getItem('t') })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addWorkspace(name: string, group: number): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}addWorkspace.php`, {
      t: localStorage.getItem('t'),
      n: name,
      wsg: group
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  changeWorkspace(wsId: number, wsName: string, wsGroup: number): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}setWorkspace.php`, {
      t: localStorage.getItem('t'),
      ws_id: wsId,
      ws_name: wsName,
      ws_group: wsGroup
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  deleteWorkspaces(workspaces: number[]): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}deleteWorkspaces.php`, { t: localStorage.getItem('t'), ws: workspaces })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  // *******************************************************************
  getUsersByWorkspace(workspaceId: number): Observable<IdLabelSelectedData[]> {
    return this.http
      .post<IdLabelSelectedData[]>(`${this.serverUrl}getWorkspaceUsers.php`,
      { t: localStorage.getItem('t'), ws: workspaceId })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setUsersByWorkspace(workspace: number, accessing: IdLabelSelectedData[]): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}setWorkspaceUsers.php`,
      { t: localStorage.getItem('t'), w: workspace, u: accessing })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  // todo: replace with getPlayers
  getItemPlayerFiles(): Observable<GetFileResponseData[]> {
    return this.http
      .post<GetFileResponseData[]>(`${this.serverUrl}getItemPlayerFiles.php`, { t: localStorage.getItem('t') })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getVeronaModuleList(): Observable<VeronaModuleData[]> {
    return this.http
      .post<VeronaModuleData[]>(`${this.serverUrl}getVeronaModuleList.php`, { t: localStorage.getItem('t') })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  deleteVeronaModules(files: string[]): Observable<string> {
    return this.http
      .post<string>(`${this.serverUrl}deleteVeronaModule.php`, { t: localStorage.getItem('t'), f: files })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  getWorkspaceGroupList(): Observable<WorkspaceGroupData[]> {
    return this.http
      .post<WorkspaceGroupData[]>(`${this.serverUrl}getWorkspaceGroups.php`, { t: localStorage.getItem('t') })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addWorkspaceGroup(name: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}addWorkspaceGroup.php`, {
      t: localStorage.getItem('t'), n: name
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  deleteWorkspaceGroup(id: number): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}deleteWorkspaceGroup.php`, {
      t: localStorage.getItem('t'), wsg: id
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  renameWorkspaceGroup(id: number, newName: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}setWorkspaceGroup.php`, {
      t: localStorage.getItem('t'), wsg_id: id, wsg_name: newName
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setAppConfig(appConfig: ConfigFullDto): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}setConfig.php`, {
      t: localStorage.getItem('t'), c: JSON.stringify(appConfig)
    })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }
}

export interface IdLabelSelectedData {
  id: number;
  label: string;
  selected: boolean;
}

export interface WorkspaceData {
  id: number;
  label: string;
  ws_group_id: number;
  ws_group_name: string;
  selected: boolean;
}

export interface GetFileResponseData {
  filename: string;
  filesize: number;
  filesizestr: string;
  filedatetime: string;
  filedatetimestr: string;
  selected: boolean;
}

export interface VeronaModuleData {
  id: string;
  name: string;
  filesizeStr: string;
  filesize: number;
  fileDatetime: number;
  apiVersion: string;
  isPlayer: boolean;
  isEditor: boolean;
  description: string;
}

export interface WorkspaceGroupData {
  id: number;
  label: string;
  ws_count: number;
}
