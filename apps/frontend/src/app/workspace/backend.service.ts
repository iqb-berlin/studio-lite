import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import {
  CreateUnitDto,
  RequestReportDto,
  UnitDefinitionDto, UnitDownloadSettingsDto,
  UnitInListDto,
  UnitMetadataDto,
  UnitSchemeDto,
  VeronaModuleFileDto,
  VeronaModuleInListDto,
  WorkspaceFullDto
} from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getUnitList(workspaceId: number): Observable <UnitInListDto[]> {
    return this.http
      .get<UnitInListDto[]>(`${this.serverUrl}workspace/${workspaceId}/units`)
      .pipe(
        catchError(() => [])
      );
  }

  getUnitListWithMetadata(workspaceId: number): Observable <UnitMetadataDto[]> {
    return this.http
      .get<UnitMetadataDto[]>(`${this.serverUrl}workspace/${workspaceId}/units/metadata`)
      .pipe(
        catchError(() => [])
      );
  }

  getWorkspaceData(workspaceId: number): Observable<WorkspaceFullDto | null> {
    return this.http
      .get<WorkspaceFullDto>(
      `${this.serverUrl}workspace/${workspaceId}`
    )
      .pipe(
        catchError(() => of(null))
      );
  }

  addUnit(workspaceId: number, newUnit: CreateUnitDto): Observable<number | null> {
    return this.http
      .post<number>(`${this.serverUrl}workspace/${workspaceId}/units`, newUnit)
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  copyUnit(workspaceId: number,
           fromUnit: number, key: string, label: string): Observable<number | null> {
    return this.http
      .put<string>(`${this.serverUrl}addUnit.php`,
      {
        t: localStorage.getItem('t'), ws: workspaceId, u: fromUnit, k: key, l: label
      })
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  deleteUnits(workspaceId: number, units: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspace/${workspaceId}/${units.join(';')}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  /*
  moveUnits(workspaceId: number,
            units: number[], targetWorkspace: number): Observable<boolean | number> {
    const authToken = localStorage.getItem('t');
    if (!authToken) {
      return of(401);
    }
    return this.http
      .put<UnitInListDto[]>(`${this.serverUrl}moveUnits.php`,
      {
        t: authToken, ws: workspaceId, u: units, tws: targetWorkspace
      })
      .pipe(
        catchError(err => throwError(new AppHttpError(err))),
        map((unMovableUnits: UnitInListDto[]) => {
          if (unMovableUnits.length === 0) return true;
          return unMovableUnits.length;
        })
      );
  }
   */

  downloadUnits(workspaceId: number, settings: UnitDownloadSettingsDto): Observable<Blob> {
    return this.http.get(`${this.serverUrl}workspace/${workspaceId}/download/${JSON.stringify(settings)}`, {
      headers: {
        Accept: 'application/zip'
      },
      responseType: 'blob'
    });
  }

  getUnitMetadata(workspaceId: number, unitId: number): Observable<UnitMetadataDto | null> {
    return this.http
      .get<UnitMetadataDto>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/metadata`)
      .pipe(
        catchError(() => of(null))
      );
  }

  getUnitDefinition(workspaceId: number, unitId: number): Observable<UnitDefinitionDto | null> {
    return this.http
      .get<UnitDefinitionDto>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/definition`)
      .pipe(
        catchError(() => of(null))
      );
  }

  getUnitScheme(workspaceId: number, unitId: number): Observable<UnitSchemeDto | null> {
    return this.http
      .get<UnitSchemeDto>(`${this.serverUrl}workspace/${workspaceId}/${unitId}/scheme`)
      .pipe(
        catchError(() => of(null))
      );
  }

  setUnitMetadata(workspaceId: number, unitData: UnitMetadataDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitData.id}/metadata`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  uploadUnits(workspaceId: number, files: FileList | null): Observable<RequestReportDto | number> {
    if (files) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      return this.http.post<RequestReportDto>(`${this.serverUrl}workspace/${workspaceId}/upload`, formData, {
        reportProgress: true,
        observe: 'events'
      }).pipe(
        map(event => {
          if (event) {
            if (event.type === HttpEventType.UploadProgress) {
              return Math.round(100 * (event.loaded / (event.total ? event.total : 1)));
            }
            if (event.type === HttpEventType.Response) {
              return event.body || {
                source: 'upload-units',
                messages: [{ objectKey: '', messageKey: 'upload-units.request-error' }]
              };
            }
            return 0;
          }
          return -1;
        })
      );
    }
    return of(-1);
  }

  setUnitDefinition(workspaceId: number, unitId: number, unitData: UnitDefinitionDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitId}/definition`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  setUnitScheme(workspaceId: number, unitId: number, unitData: UnitSchemeDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace/${workspaceId}/${unitId}/scheme`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getModuleHtml(moduleId: string): Observable<VeronaModuleFileDto | null> {
    return this.http
      .get<VeronaModuleFileDto>(`${this.serverUrl}admin/verona-module/${moduleId}`)
      .pipe(
        catchError(() => of(null))
      );
  }

  getModuleList(type: string): Observable<VeronaModuleInListDto[]> {
    return this.http
      .get<VeronaModuleInListDto[]>(`${this.serverUrl}admin/verona-modules/${type}`)
      .pipe(
        catchError(() => of([]))
      );
  }

  /*
  setWorkspaceSettings(workspaceId: number, settings: WorkspaceSettings): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}setWorkspaceSettings.php`, {
      t: localStorage.getItem('t'),
      ws: workspaceId,
      s: settings
    })
      .pipe(
        catchError(() => of(false))
      );
  }
   */
}

export interface WorkspaceSettings {
  defaultPlayer: string;
  defaultEditor: string
}
