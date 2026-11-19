import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  UserFullDto,
  UserInListDto,
  UsersWorkspaceInListDto,
  UserWorkspaceAccessDto,
  WorkspaceGroupFullDto,
  WorkspaceUserInListDto,
  UnitInViewDto,
  UnitItemInViewDto,
  WorkspaceReportDto
} from '@studio-lite-lib/api-dto';
import { succeeded } from '../../../utils/succeeded.utils';

/**
 * Every call the group administration makes: the workspaces of a group, who works in them and at
 * which level, and the units and items across the group.
 *
 * The group admin's counterpart to the administrator's backend service of the same name.
 */
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
      .get<UserInListDto[]>(`${this.serverUrl}users`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getAllUnitsForGroup(groupId: number): Observable<UnitInViewDto[] | boolean> {
    return this.http.get<UnitInViewDto[]>(`${this.serverUrl}workspace-groups/${groupId}/units`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getAllUnitItemsForGroup(groupId: number): Observable<UnitItemInViewDto[] | boolean> {
    return this.http.get<UnitItemInViewDto[]>(`${this.serverUrl}workspace-groups/${groupId}/unit-items`)
      .pipe(
        catchError(() => of(false))
      );
  }

  deleteWorkspaceUnit(workspaceId: number, unitId: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}`)
      .pipe(succeeded());
  }

  deleteUnitItem(workspaceId: number, unitId: number, uuid: string): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/items/${uuid}`)
      .pipe(succeeded());
  }

  getUsersFull(): Observable<UserFullDto[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('full', true);
    return this.http
      .get<UserFullDto[]>(`${this.serverUrl}users`, { params: queryParams })
      .pipe(
        catchError(() => of([]))
      );
  }

  // A failure is answered with null, not with an empty list: saving a role onto that list would
  // remove the user from every other workspace of the group (#2074).
  getWorkspacesByUser(workspaceGroupId: number, userId: number): Observable<UsersWorkspaceInListDto[] | null> {
    return this.http
      .get<UsersWorkspaceInListDto[]>(
        `${this.serverUrl}workspace-groups/${workspaceGroupId}/users/${userId}/workspaces`
      )
      .pipe(
        catchError(() => of(null))
      );
  }

  setWorkspacesByUser(
    workspaceGroupId: number,
    userId: number,
    accessTo: UserWorkspaceAccessDto[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace-groups/${workspaceGroupId}/users/${userId}/workspaces`, accessTo)
      .pipe(succeeded());
  }

  getWorkspaces(workspaceGroupId: number): Observable<UsersWorkspaceInListDto[]> {
    return this.http
      .get<UsersWorkspaceInListDto[]>(`${this.serverUrl}workspace-groups/${workspaceGroupId}/workspaces`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addWorkspace(workspaceGroupId: number, name: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}workspace-groups/${workspaceGroupId}/workspaces`, { name })
      .pipe(succeeded());
  }

  renameWorkspace(workspaceId: number, newName: string): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/name`, { name: newName })
      .pipe(succeeded());
  }

  selectWorkspaceDropBox(workspaceId: number, dropBoxId: number): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/drop-box`, { dropBoxId })
      .pipe(succeeded());
  }

  deleteWorkspaces(workspaces: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    workspaces.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}workspaces`, { params: queryParams })
      .pipe(succeeded());
  }

  moveWorkspaces(workspaceGroupId: number, workspaces: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/group-id`, { targetId: workspaceGroupId, ids: workspaces })
      .pipe(succeeded());
  }

  // *******************************************************************
  // A failure is answered with null, not with an empty list: saving a role onto that list would
  // remove everyone else from the workspace (#2074).
  getUsersByWorkspace(workspaceId: number): Observable<WorkspaceUserInListDto[] | null> {
    return this.http
      .get<WorkspaceUserInListDto[]>(`${this.serverUrl}workspaces/${workspaceId}/access`)
      .pipe(
        catchError(() => of(null))
      );
  }

  setUsersByWorkspace(workspaceId: number, accessTo: UserWorkspaceAccessDto[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/access`, accessTo)
      .pipe(succeeded());
  }

  getWorkspaceGroupData(workspaceGroupId: number): Observable<WorkspaceGroupFullDto | null> {
    return this.http
      .get<WorkspaceGroupFullDto>(
        `${this.serverUrl}workspace-groups/${workspaceGroupId}`
      )
      .pipe(
        catchError(() => of(null))
      );
  }

  // A failure is answered with null: passed on as an error, it never reached the handler that takes
  // the spinner down (#2106).
  getWorkspaceReport(workspaceGroupId: number): Observable<WorkspaceReportDto[] | null> {
    return this.http.get<WorkspaceReportDto[]>(`${this.serverUrl}workspace-groups/${workspaceGroupId}/report`).pipe(
      catchError(() => of(null))
    );
  }
}
