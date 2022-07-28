import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import {
  CreateReviewDto,
  CreateUnitDto,
  RequestReportDto, ReviewFullDto, ReviewInListDto,
  UnitDefinitionDto, UnitDownloadSettingsDto,
  UnitInListDto,
  UnitMetadataDto,
  UnitSchemeDto, UsersInWorkspaceDto,
  VeronaModuleFileDto
} from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getUnitList(workspaceId: number, params?: HttpParams): Observable <UnitInListDto[]> {
    return this.http
      .get<UnitInListDto[]>(`${this.serverUrl}workspace/${workspaceId}/units`, { params: params })
      .pipe(
        catchError(() => [])
      );
  }

  getUsersList(workspaceId: number): Observable <UsersInWorkspaceDto | boolean> {
    return this.http
      .get<UsersInWorkspaceDto>(`${this.serverUrl}workspace/${workspaceId}/users`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getUnitListWithMetadata(workspaceId: number): Observable <UnitMetadataDto[]> {
    return this.http
      .get<UnitMetadataDto[]>(`${this.serverUrl}workspace/${workspaceId}/units/metadata`)
      .pipe(
        catchError(() => [])
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

  deleteUnits(workspaceId: number, units: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspace/${workspaceId}/${units.join(';')}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  moveOrCopyUnits(workspaceId: number, units: number[],
                  targetWorkspace: number, moveOnly: boolean): Observable<boolean | RequestReportDto> {
    const newUnitMode = moveOnly ? 'moveto' : 'copyto';
    return this.http
      .patch<RequestReportDto>(
      `${this.serverUrl}workspace/${workspaceId}/${units.join(';')}/${newUnitMode}/${targetWorkspace}`,
      {}
    )
      .pipe(
        catchError(() => of(false))
      );
  }

  downloadUnits(workspaceId: number, settings: UnitDownloadSettingsDto): Observable<Blob | number | null> {
    return this.http.get(`${this.serverUrl}workspace/${workspaceId}/download/${JSON.stringify(settings)}`, {
      headers: {
        Accept: 'application/zip'
      },
      responseType: 'blob',
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        if (event) {
          if (event.type === HttpEventType.DownloadProgress) {
            return event.total ? Math.round(100 * (event.loaded / event.total)) : event.loaded;
          }
          if (event.type === HttpEventType.Response) {
            return event.body;
          }
          return 0;
        }
        return -1;
      })
    );
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
              return event.total ? Math.round(100 * (event.loaded / event.total)) : event.loaded;
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

  getReviewList(workspaceId: number): Observable <ReviewInListDto[]> {
    return this.http
      .get<ReviewInListDto[]>(`${this.serverUrl}workspace/${workspaceId}/reviews`)
      .pipe(
        catchError(() => [])
      );
  }

  getReview(workspaceId: number, reviewId: number): Observable <ReviewFullDto | null> {
    return this.http
      .get<ReviewFullDto>(`${this.serverUrl}workspace/${workspaceId}/reviews/${reviewId}`)
      .pipe(
        catchError(() => of(null))
      );
  }

  setReview(workspaceId: number, reviewId: number, reviewData: ReviewFullDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspace/${workspaceId}/reviews/${reviewId}`, reviewData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  addReview(workspaceId: number, newReview: CreateReviewDto): Observable<number | null> {
    return this.http
      .post<number>(`${this.serverUrl}workspace/${workspaceId}/reviews`, newReview)
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  deleteReviews(workspaceId: number, reviews: number[]): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspace/${workspaceId}/reviews/${reviews.join(';')}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}
