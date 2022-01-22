import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { AppConfig, AppHttpError } from '../backend.service';
import {
  ConfigFullDto,
  CreateUserDto, CreateWorkspaceDto,
  UserFullDto,
  UserInListDto,
  WorkspaceFullDto,
  WorkspaceInListDto
} from "@studio-lite-lib/api-admin";
import {WorkspaceGroupDto} from "@studio-lite-lib/api-start";
import {accessSync} from "fs";

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

  addUser(newUser: CreateUserDto): Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}admin/users`, newUser)
      .pipe(
        map(() => true)
      );
  }

  changeUserData(newData: UserFullDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users`,newData)
      .pipe(
        map(() => true)
      );
  }

  deleteUsers(users: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/users/${users.join(';')}`)
      .pipe(
        map(() => true)
      );
  }

  getWorkspacesByUser(userId: number): Observable<WorkspaceInListDto[]> {
    return this.http
      .get<WorkspaceInListDto[]>(`${this.serverUrl}admin/users/${userId}/workspaces`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setWorkspacesByUser(userId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${userId}/workspaces/${accessTo.join(';')}`, undefined)
      .pipe(
        map(() => true)
      );
  }

  getWorkspacesGroupwise(): Observable<WorkspaceGroupDto[]> {
    return this.http
      .get<WorkspaceGroupDto[]>(`${this.serverUrl}admin/workspaces/groupwise`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addWorkspace(createWorkspaceDto: CreateWorkspaceDto): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}admin/workspaces`, createWorkspaceDto)
      .pipe(
        map(() => true)
      );
  }

  changeWorkspace(workspaceData: WorkspaceFullDto): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}admin/workspaces`, workspaceData)
      .pipe(
        map(() => true)
      );
  }

  deleteWorkspaces(workspaces: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/workspaces/${workspaces.join(';')}`)
      .pipe(
        map(() => true)
      );
  }

  // *******************************************************************
  getUsersByWorkspace(workspaceId: number): Observable<UserInListDto[]> {
    return this.http
      .get<UserInListDto[]>(`${this.serverUrl}admin/workspaces/${workspaceId}/users`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  setUsersByWorkspace(workspaceId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/workspaces/${workspaceId}/users/${accessTo.join(';')}`, undefined)
      .pipe(
        map(() => true)
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
