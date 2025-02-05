import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';
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
  UnitByDefinitionIdDto
} from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  setWorkspaceGroupProfiles(settings:WorkspaceGroupSettingsDto, workspaceGroupId: number): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/workspace-groups/`, { id: workspaceGroupId, settings: settings })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
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

  getUserFull(id: number): Observable<UserFullDto | null> {
    return this.http
      .get<UserFullDto>(`${this.serverUrl}admin/users/${id}`)
      .pipe(
        catchError(() => of(null))
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

  getWorkspaceGroupsByAdmin(userId: number): Observable<WorkspaceGroupInListDto[]> {
    return this.http
      .get<WorkspaceGroupInListDto[]>(`${this.serverUrl}admin/users/${userId}/workspace-groups`)
      .pipe(
        catchError(() => of([]))
      );
  }

  setWorkspaceGroupsByAdmin(userId: number, accessTo: number[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/users/${userId}/workspace-groups`, accessTo)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
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
      .patch(`${this.serverUrl}admin/workspace-groups/${workspaceGroupId}/admins`, accessTo)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
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
      .delete(`${this.serverUrl}admin/workspace-groups`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  changeWorkspaceGroup(workspaceGroupData: WorkspaceGroupFullDto): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}admin/workspace-groups`, workspaceGroupData)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
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

  deleteResourcePackage(id: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/resource-packages/${id}`)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  deleteResourcePackages(params: HttpParams): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}admin/resource-packages`, { params: params })
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  createResourcePackage(zippedResourcePackage: FormData): Observable<HttpEvent<unknown>> {
    return this.http
      .post(`${this.serverUrl}admin/resource-packages`, zippedResourcePackage, {
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        catchError(err => of(err)),
        map(progress => progress)
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

  setMissingsProfiles(missingsProfiles: MissingsProfilesDto[]): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}admin/settings/missings-profiles`, missingsProfiles)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
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
    return this.http.get(
      `${this.serverUrl}admin/verona-modules/download/${moduleKey}`,
      {
        headers: {
          Accept: 'text/html'
        },
        responseType: 'blob'
      }
    );
  }

  getUnits(): Observable<UnitByDefinitionIdDto[]> {
    return this.http
      .get<UnitByDefinitionIdDto[]>(`${this.serverUrl}admin/workspace-groups/units`)
      .pipe(
        catchError(() => of([]))
      );
  }

  getXlsWorkspaces(): Observable<Blob> {
    return this.http.get(
      `${this.serverUrl}download/xlsx/workspaces`,
      {
        headers: {
          Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        responseType: 'blob'
      }
    );
  }
}
