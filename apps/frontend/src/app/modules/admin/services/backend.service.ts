import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  MissingsProfilesDto,
  ConfigDto,
  AppLogoDto,
  CreateUserDto,
  CreateWorkspaceGroupDto,
  UserFullDto,
  UserInListDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto,
  UnitExportConfigDto,
  WorkspaceFullDto,
  UnitInViewDto,
  UnitItemInViewDto,
  ProfilesRegistryDto,
  UnitRichNoteTagDto
} from '@studio-lite-lib/api-dto';
import { succeeded } from '../../../utils/succeeded.utils';
import { Profile } from '../../../models/profile.type';

/**
 * Every call the administration area makes: users and their sessions, workspace groups and their
 * admins, the installation-wide settings, and the lists that span the whole installation.
 *
 * One of three backend services with this name -- each area has its own, and this is the
 * administrator's.
 */
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getAllWorkspaces(): Observable<WorkspaceFullDto[] | boolean> {
    return this.http.get<WorkspaceFullDto[]>(`${this.serverUrl}admin/workspaces`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getAllUnits(): Observable<UnitInViewDto[] | boolean> {
    return this.http.get<UnitInViewDto[]>(`${this.serverUrl}admin/units`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getAllUnitItems(): Observable<UnitItemInViewDto[] | boolean> {
    return this.http.get<UnitItemInViewDto[]>(`${this.serverUrl}admin/unit-items`)
      .pipe(
        catchError(() => of(false))
      );
  }

  /**
   * Sets the metadata profiles of a group and nothing else of its settings: the API lays the settings
   * sent over the stored ones, so any further field would overwrite the group's states or default
   * modules (#1960).
   */
  setWorkspaceGroupProfiles(profiles: Profile[], workspaceGroupId: number): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}`, {
        id: workspaceGroupId,
        settings: { profiles }
      })
      .pipe(succeeded());
  }

  getWorkspaceGroupById(workspaceGroupId: number):Observable<boolean | WorkspaceGroupFullDto> {
    return this.http
      .get<WorkspaceGroupFullDto>(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getWorkspaceById(workspaceId: number):Observable<boolean | WorkspaceFullDto> {
    return this.http
      .get<WorkspaceFullDto>(`${this.serverUrl}workspaces/${workspaceId}`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getUsers(): Observable<UserInListDto[]> {
    return this.http
      .get<UserInListDto[]>(`${this.serverUrl}group-admin/users`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getUsersFull(): Observable<UserFullDto[]> {
    return this.getUsersFullRequest(false);
  }

  getUsersFullWithActivity(): Observable<UserFullDto[]> {
    return this.getUsersFullRequest(true);
  }

  private getUsersFullRequest(countAsActivity: boolean): Observable<UserFullDto[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('full', true);
    const headers = countAsActivity ? new HttpHeaders({ 'x-activity-intent': 'user' }) : undefined;
    const requestOptions = { params: queryParams, headers };
    return this.http
      .get<UserFullDto[]>(`${this.serverUrl}group-admin/users`, requestOptions)
      .pipe(
        catchError(() => of([]))
      );
  }

  addUser(newUser: CreateUserDto): Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}admin/users`, newUser)
      .pipe(succeeded());
  }

  changeUserData(id: number, newData: UserFullDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${id}`, newData)
      .pipe(succeeded());
  }

  deleteUsers(users: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    users.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}admin/users`, { params: queryParams })
      .pipe(succeeded());
  }

  deleteUserSession(userId: number, sessionId: string): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/users/${userId}/sessions/${sessionId}`)
      .pipe(succeeded());
  }

  deleteUserOrphanedSessions(userId: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/users/${userId}/orphaned-sessions`)
      .pipe(succeeded());
  }

  getWorkspaceGroupsByAdmin(userId: number): Observable<WorkspaceGroupInListDto[]> {
    return this.http
      .get<WorkspaceGroupInListDto[]>(`${this.serverUrl}admin/users/${userId}/workspace-groups`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspaceGroupsByAdmin(userId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${userId}/workspace-groups`, { ids: accessTo })
      .pipe(succeeded());
  }

  getWorkspaceGroupAdmins(workspaceGroupId: number): Observable<UserInListDto[]> {
    return this.http
      .get<UserInListDto[]>(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}/admins`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspaceGroupAdmins(workspaceGroupId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}admin/workspace-groups/${workspaceGroupId}/admins`,
        accessTo
      )
      .pipe(succeeded());
  }

  deleteVeronaModules(files: string[]): Observable<boolean> {
    let queryParams = new HttpParams();
    files.forEach(file => { queryParams = queryParams.append('key', file); });
    return this.http
      .delete(`${this.serverUrl}admin/verona-modules`, { params: queryParams })
      .pipe(succeeded());
  }

  getWorkspaceGroupList(): Observable<WorkspaceGroupInListDto[]> {
    return this.http
      .get<WorkspaceGroupInListDto[]>(`${this.serverUrl}admin/workspace-groups`)
      .pipe(
        catchError(() => of([]))
      );
  }

  addWorkspaceGroup(workspaceGroupData: CreateWorkspaceGroupDto): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.serverUrl}admin/workspace-groups`, workspaceGroupData)
      .pipe(
        catchError(() => of(false))
      );
  }

  deleteWorkspaceGroups(ids: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    ids.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}admin/workspace-groups`, {
        params: queryParams
      })
      .pipe(succeeded());
  }

  changeWorkspaceGroup(workspaceGroupData: WorkspaceGroupFullDto): Observable<boolean> {
    return this.http
      .patch<boolean>(
        `${this.serverUrl}admin/workspace-groups/${workspaceGroupData.id}`,
        workspaceGroupData
      )
      .pipe(succeeded());
  }

  // Unlike getConfig of the app's BackendService, which falls back on the defaults for the start
  // page, this answers a failure with null: the form must not offer those defaults for saving (#1968).
  getAppConfig(): Observable<ConfigDto | null> {
    return this.http
      .get<ConfigDto>(`${this.serverUrl}admin/settings/config`)
      .pipe(
        catchError(() => of(null))
      );
  }

  setAppConfig(appConfig: ConfigDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/config`, appConfig)
      .pipe(succeeded());
  }

  setAppLogo(appLogo: AppLogoDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/app-logo`, appLogo)
      .pipe(succeeded());
  }

  deleteResourcePackages(ids: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    ids.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}admin/resource-packages`, {
        params: queryParams
      })
      .pipe(succeeded());
  }

  getProfilesRegistry(): Observable<ProfilesRegistryDto> {
    return this.http
      .get<ProfilesRegistryDto>(`${this.serverUrl}admin/settings/profiles-registry`);
  }

  setProfilesRegistry(profilesRegistryDto: ProfilesRegistryDto): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}admin/settings/profiles-registry`,
        profilesRegistryDto
      )
      .pipe(succeeded());
  }

  getUnitExportConfig(): Observable<UnitExportConfigDto> {
    return this.http
      .get<UnitExportConfigDto>(`${this.serverUrl}admin/settings/unit-export-config`);
  }

  setUnitExportConfig(unitExportConfig: UnitExportConfigDto): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}admin/settings/unit-export-config`,
        unitExportConfig
      )
      .pipe(succeeded());
  }

  setMissingsProfiles(missingsProfiles: MissingsProfilesDto[]): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}admin/settings/missings-profiles`,
        missingsProfiles
      )
      .pipe(succeeded());
  }

  getMissingsProfiles():Observable<MissingsProfilesDto[]> {
    return this.http
      .get<MissingsProfilesDto[]>(`${this.serverUrl}admin/settings/missings-profiles`)
      .pipe(
        // An empty list, not an empty array returned from catchError: that one emits nothing, and
        // the form never learns that the load is over (#1943).
        catchError(() => of([]))
      );
  }

  getUnitRichNoteTags(): Observable<UnitRichNoteTagDto[]> {
    return this.http
      .get<UnitRichNoteTagDto[]>(`${this.serverUrl}admin/settings/unit-rich-note-tags`)
      .pipe(
        catchError(() => of([]))
      );
  }

  // A failure is answered with null, not with an empty config: the form would offer an empty field
  // for saving over the stored URLs (#1993).
  getUnitRichNoteTagsConfig(): Observable<UnitRichNoteTagDto[] | string[] | string | null> {
    return this.http
      .get<UnitRichNoteTagDto[] | string[] | string>(`${this.serverUrl}admin/settings/unit-rich-note-tags-config`)
      .pipe(
        catchError(() => of(null))
      );
  }

  setUnitRichNoteTags(tags: UnitRichNoteTagDto[] | string[] | string): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/unit-rich-note-tags`, tags)
      .pipe(succeeded());
  }

  downloadModule(moduleKey: string): Observable<Blob> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('download', true);
    return this.http.get(
      `${this.serverUrl}verona-modules/${moduleKey}`,
      {
        headers: {
          Accept: 'text/html'
        },
        params: queryParams,
        responseType: 'blob'
      }
    );
  }

  getUnits(): Observable<UnitInViewDto[]> {
    return this.http
      .get<UnitInViewDto[]>(`${this.serverUrl}admin/workspace-groups/units`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getXlsWorkspaces(): Observable<Blob> {
    const queryParams = new HttpParams().set('download', 'true');
    return this.http.get(
      `${this.serverUrl}admin/workspace-groups`,
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
