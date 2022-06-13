import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {
  ConfigDto, AppLogoDto,
  CreateUserDto, CreateWorkspaceDto, CreateWorkspaceGroupDto,
  UserFullDto,
  UserInListDto,
  WorkspaceFullDto, WorkspaceGroupFullDto, WorkspaceGroupInListDto,
  WorkspaceInListDto,
  WorkspaceGroupDto, VeronaModuleInListDto
} from "@studio-lite-lib/api-dto";
import {AppHttpError} from "../app.classes";

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

  getVeronaModuleList(type: string): Observable<VeronaModuleInListDto[]> {
    return this.http
      .get<VeronaModuleInListDto[]>(`${this.serverUrl}admin/verona-modules/${type}`)
      .pipe(
        catchError(() => [])
      );
  }

  deleteVeronaModules(files: string[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/verona-modules/${files.join(';')}`)
      .pipe(
        map(() => true)
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
        name: name,
        settings: {}
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

  setAppConfig(appConfig: ConfigDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/config`, appConfig)
      .pipe(
        map(() => true)
      )
  }

  setAppLogo(appLogo: AppLogoDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/app-logo`, appLogo)
      .pipe(
        map(() => true)
      )
  }
}
