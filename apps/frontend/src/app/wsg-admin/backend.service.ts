import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  CreateWorkspaceDto,
  UserFullDto,
  UserInListDto,
  WorkspaceInListDto
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

  getWorkspaces(workspaceGroupId: number): Observable<WorkspaceInListDto[]> {
    return this.http
      .get<WorkspaceInListDto[]>(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}/workspaces`)
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
      .patch(`${this.serverUrl}workspace/${workspaceId}/rename/${newName}`, {})
      .pipe(
        map(() => true),
        catchError(() => of(false))
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
}
