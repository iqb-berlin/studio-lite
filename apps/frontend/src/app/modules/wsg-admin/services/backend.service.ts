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
  WorkspaceUserInListDto
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

  getWorkspacesByUser(userId: number): Observable<UsersWorkspaceInListDto[]> {
    return this.http
      .get<UsersWorkspaceInListDto[]>(`${this.serverUrl}admin/users/${userId}/workspaces`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspacesByUser(
    userId: number,
    accessTo: UserWorkspaceAccessDto[],
    workspaceGroupId: number): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${userId}/workspaces/${workspaceGroupId}`, accessTo)
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
      .post<boolean>(`${this.serverUrl}admin/workspaces`, createWorkspaceDto)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  renameWorkspace(workspaceId: number, newName: string): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/rename/${newName}`, {})
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
      .delete(`${this.serverUrl}admin/workspaces`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  deleteStateInWorkspaceGroupUnits(workspaceGroupId:number, stateId:number):Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspace-groups/${workspaceGroupId}/${stateId}`)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  moveWorkspaces(workspaceGroupId: number, workspaces: number[]): Observable<boolean | object> {
    return this.http
      .patch(`${this.serverUrl}admin/workspaces/move`, { targetId: workspaceGroupId, ids: workspaces })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  // *******************************************************************
  getUsersByWorkspace(workspaceId: number): Observable<WorkspaceUserInListDto[]> {
    return this.http
      .get<WorkspaceUserInListDto[]>(`${this.serverUrl}admin/workspaces/${workspaceId}/users`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setUsersByWorkspace(workspaceId: number, accessTo: UserWorkspaceAccessDto[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/workspaces/${workspaceId}/users`, accessTo)
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
    return this.http.get(
      `${this.serverUrl}download/xlsx/workspaces/${workspaceGroupId}`,
      {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      }
    );
  }
}
