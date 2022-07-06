import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ConfigDto, AppLogoDto,
  CreateUserDto, CreateWorkspaceDto, CreateWorkspaceGroupDto,
  UserFullDto,
  UserInListDto,
  WorkspaceFullDto, WorkspaceGroupFullDto, WorkspaceGroupInListDto,
  WorkspaceInListDto,
  WorkspaceGroupDto, VeronaModuleInListDto, UnitExportConfigDto
} from '@studio-lite-lib/api-dto';

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
        catchError(() => of([]))
      );
  }

  getUsersFull(): Observable<UserFullDto[]> {
    return this.http
      .get<UserFullDto[]>(`${this.serverUrl}admin/users/full`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addUser(newUser: CreateUserDto): Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}admin/users`, newUser)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  changeUserData(newData: UserFullDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users`, newData)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  deleteUsers(users: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/users/${users.join(';')}`)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getWorkspacesByUser(userId: number): Observable<WorkspaceInListDto[]> {
    return this.http
      .get<WorkspaceInListDto[]>(`${this.serverUrl}admin/users/${userId}/workspaces`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspacesByUser(userId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${userId}/workspaces`, accessTo)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getWorkspacesGroupwise(): Observable<WorkspaceGroupDto[]> {
    return this.http
      .get<WorkspaceGroupDto[]>(`${this.serverUrl}admin/workspaces/groupwise`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addWorkspace(createWorkspaceDto: CreateWorkspaceDto): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}admin/workspaces`, createWorkspaceDto)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  changeWorkspace(workspaceData: WorkspaceFullDto): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}admin/workspaces`, workspaceData)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  deleteWorkspaces(workspaces: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/workspaces/${workspaces.join(';')}`)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  // *******************************************************************
  getUsersByWorkspace(workspaceId: number): Observable<UserInListDto[]> {
    return this.http
      .get<UserInListDto[]>(`${this.serverUrl}admin/workspaces/${workspaceId}/users`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setUsersByWorkspace(workspaceId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/workspaces/${workspaceId}/users`, accessTo)
      .pipe(
        catchError(() => of(false)),
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
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getWorkspaceGroupList(): Observable<WorkspaceGroupInListDto[]> {
    return this.http
      .get<WorkspaceGroupInListDto[]>(`${this.serverUrl}admin/workspace-groups`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addWorkspaceGroup(name: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}admin/workspace-groups`, <CreateWorkspaceGroupDto>{
        name: name,
        settings: {}
      })
      .pipe(
        catchError(() => of(false))
      );
  }

  deleteWorkspaceGroup(id: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/workspace-groups/${id}`)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  renameWorkspaceGroup(id: number, newName: string): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}admin/workspace-groups`, <WorkspaceGroupFullDto>{
        id: id, name: newName
      })
      .pipe(
        catchError(() => of(false))
      );
  }

  setAppConfig(appConfig: ConfigDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/config`, appConfig)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  setAppLogo(appLogo: AppLogoDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/app-logo`, appLogo)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getUnitExportConfig(): Observable<UnitExportConfigDto> {
    return this.http
      .get<UnitExportConfigDto>(`${this.serverUrl}admin/settings/unit-export-config`);
  }

  setUnitExportConfig(unitExportConfig: UnitExportConfigDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/unit-export-config`, unitExportConfig)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }
}
