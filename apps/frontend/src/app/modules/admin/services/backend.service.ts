import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
  WorkspaceGroupSettingsDto,
  WorkspaceFullDto,
  UnitInViewDto,
  UnitItemDto,
  ProfilesRegistryDto
} from '@studio-lite-lib/api-dto';

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

  getAllUnitItems(): Observable<UnitItemDto[] | boolean> {
    return this.http.get<UnitItemDto[]>(`${this.serverUrl}admin/unit-items`)
      .pipe(
        catchError(() => of(false))
      );
  }

  setWorkspaceGroupProfiles(settings:WorkspaceGroupSettingsDto, workspaceGroupId: number): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}`, {
        id: workspaceGroupId,
        settings: settings
      })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
    let queryParams = new HttpParams();
    queryParams = queryParams.append('full', true);
    return this.http
      .get<UserFullDto[]>(`${this.serverUrl}group-admin/users`, { params: queryParams })
      .pipe(
        catchError(() => of([]))
      );
  }

  addUser(newUser: CreateUserDto): Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}admin/users`, newUser)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  changeUserData(id: number, newData: UserFullDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${id}`, newData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteUsers(users: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    users.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}admin/users`, { params: queryParams })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteVeronaModules(files: string[]): Observable<boolean> {
    let queryParams = new HttpParams();
    files.forEach(file => { queryParams = queryParams.append('key', file); });
    return this.http
      .delete(`${this.serverUrl}admin/verona-modules`, { params: queryParams })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  changeWorkspaceGroup(workspaceGroupData: WorkspaceGroupFullDto): Observable<boolean> {
    return this.http
      .patch<boolean>(
      `${this.serverUrl}admin/workspace-groups/${workspaceGroupData.id}`,
      workspaceGroupData
    )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  setAppConfig(appConfig: ConfigDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/config`, appConfig)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  setAppLogo(appLogo: AppLogoDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/app-logo`, appLogo)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  deleteResourcePackages(ids: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    ids.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}admin/resource-packages`, {
        params: queryParams
      })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
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
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  setMissingsProfiles(missingsProfiles: MissingsProfilesDto[]): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}admin/settings/missings-profiles`,
        missingsProfiles
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getMissingsProfiles():Observable<MissingsProfilesDto[]> {
    return this.http
      .get<MissingsProfilesDto[]>(`${this.serverUrl}admin/settings/missings-profiles`)
      .pipe(
        catchError(() => [])
      );
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
