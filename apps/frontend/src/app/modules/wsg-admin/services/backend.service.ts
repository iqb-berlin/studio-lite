import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateWorkspaceDto,
  UserFullDto,
  UserInListDto,
  UsersWorkspaceInListDto,
  UserWorkspaceAccessDto,
  WorkspaceGroupFullDto,
  WorkspaceUserInListDto,
  UserWorkspaceAccessForGroupDto,
  UnitByDefinitionIdDto } from '@studio-lite-lib/api-dto';

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
      .get<UserInListDto[]>(`${this.serverUrl}group-admin/users`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getAllUnitsForGroup(groupId: number): Observable<UnitByDefinitionIdDto[] | boolean> {
    return this.http.get<UnitByDefinitionIdDto[]>(`${this.serverUrl}admin/workspace-groups/${groupId}/units`)
      .pipe(
        catchError(() => of(false))
      );
  }

  deleteWorkspaceUnit(workspaceId: number, unitId: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}`)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getUsersFull(): Observable<UserFullDto[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('full', true);
    return this.http
      .get<UserFullDto[]>(`${this.serverUrl}group-admin/users`, { params: queryParams })
      .pipe(
        catchError(() => of([]))
      );
  }

  getWorkspacesByUser(userId: number): Observable<UsersWorkspaceInListDto[]> {
    return this.http
      .get<UsersWorkspaceInListDto[]>(`${this.serverUrl}group-admin/users/${userId}/workspaces`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspacesByUser(
    userId: number,
    accessTo: UserWorkspaceAccessForGroupDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}group-admin/users/${userId}/workspaces`, accessTo)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getWorkspaces(workspaceGroupId: number): Observable<UsersWorkspaceInListDto[]> {
    return this.http
      .get<UsersWorkspaceInListDto[]>(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}/workspaces`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addWorkspace(createWorkspaceDto: CreateWorkspaceDto): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}group-admin/workspaces`, createWorkspaceDto)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  renameWorkspace(workspaceId: number, newName: string): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/name`, { name: newName })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  selectWorkspaceDropBox(workspaceId: number, dropBoxId: number): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/drop-box`, { dropBoxId })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteWorkspaces(workspaces: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    workspaces.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}group-admin/workspaces`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  moveWorkspaces(workspaceGroupId: number, workspaces: number[]): Observable<boolean | object> {
    return this.http
      .patch(`${this.serverUrl}group-admin/workspaces/group-id`, { targetId: workspaceGroupId, ids: workspaces })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  // *******************************************************************
  getUsersByWorkspace(workspaceId: number): Observable<WorkspaceUserInListDto[]> {
    return this.http
      .get<WorkspaceUserInListDto[]>(`${this.serverUrl}group-admin/workspaces/${workspaceId}/users`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setUsersByWorkspace(workspaceId: number, accessTo: UserWorkspaceAccessDto[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}group-admin/workspaces/${workspaceId}/users`, accessTo)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getWorkspaceGroupData(workspaceGroupId: number): Observable<WorkspaceGroupFullDto | null> {
    return this.http
      .get<WorkspaceGroupFullDto>(
      `${this.serverUrl}admin/workspace-groups/${workspaceGroupId}`
    )
      .pipe(
        catchError(() => of(null))
      );
  }

  getWorkspaceGroupsByUser(userId: number): Observable<WorkspaceGroupFullDto[] | null> {
    return this.http
      .get<WorkspaceGroupFullDto[]>(
      `${this.serverUrl}admin/users/${userId}/workspace-groups`
    )
      .pipe(
        catchError(() => of(null))
      );
  }

  getXlsWorkspaces(workspaceGroupId: number): Observable<Blob> {
    const queryParams = new HttpParams().set('download', 'true');
    return this.http.get(
      `${this.serverUrl}workspace-groups/${workspaceGroupId}`,
      {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: queryParams,
        responseType: 'blob'
      }
    );
  }
}
