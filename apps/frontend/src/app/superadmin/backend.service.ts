import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import { AppConfig, AppHttpError } from '../backend.service';
import {
  ConfigFullDto,
  CreateUserDto, CreateWorkspaceDto, CreateWorkspaceGroupDto,
  UserFullDto,
  UserInListDto,
  WorkspaceFullDto, WorkspaceGroupFullDto, WorkspaceGroupInListDto,
  WorkspaceInListDto,
  WorkspaceGroupDto
} from "@studio-lite-lib/api-dto";

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
      .patch(`${this.serverUrl}admin/users/${userId}/workspaces`, accessTo)
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
      .patch(`${this.serverUrl}admin/workspaces/${workspaceId}/users`, accessTo)
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

  getWorkspaceGroupList(): Observable<WorkspaceGroupInListDto[]> {
    return this.http
      .get<WorkspaceGroupInListDto[]>(`${this.serverUrl}admin/workspace-groups`)
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  addWorkspaceGroup(name: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}admin/workspace-groups`, <CreateWorkspaceGroupDto>{
        name: name
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err)))
      );
  }

  deleteWorkspaceGroup(id: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/workspace-groups/${id}`)
      .pipe(map(()=>false))
  }

  renameWorkspaceGroup(id: number, newName: string): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}admin/workspace-groups`, <WorkspaceGroupFullDto>{
        id: id, name: newName
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
