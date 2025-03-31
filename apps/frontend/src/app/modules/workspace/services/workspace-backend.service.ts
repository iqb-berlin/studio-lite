import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import {
  MissingsProfilesDto,
  CodingReportDto,
  CodeBookContentSetting,
  CreateReviewDto,
  CreateUnitDto,
  RequestReportDto, ReviewFullDto, ReviewInListDto,
  UnitDefinitionDto, UnitDownloadSettingsDto,
  UnitInListDto,
  UnitPropertiesDto,
  UnitSchemeDto, UsersInWorkspaceDto, WorkspaceGroupFullDto, MetadataProfileDto, MetadataVocabularyDto
} from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceBackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getWorkspaceGroupStates(workspaceGroupId: number):Observable<WorkspaceGroupFullDto> {
    return this.http
      .get<WorkspaceGroupFullDto>(`${this.serverUrl}workspace-groups/${workspaceGroupId}`)
      .pipe(
        catchError(() => [])
      );
  }

  getMissingsProfiles():Observable<MissingsProfilesDto[]> {
    return this.http
      .get<MissingsProfilesDto[]>(`${this.serverUrl}admin/settings/missings-profiles`)
      .pipe(
        catchError(() => [])
      );
  }

  getMetadataProfile(url:string): Observable<MetadataProfileDto | null> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);

    return this.http
      .get(`${this.serverUrl}metadata/profiles`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(profile => profile as MetadataProfileDto)
      );
  }

  getMetadataVocabulariesForProfile(url:string):Observable<MetadataVocabularyDto[] | boolean> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);
    return this.http
      .get(`${this.serverUrl}metadata/vocabularies`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(vocab => vocab as MetadataVocabularyDto[])
      );
  }

  getUnitList(workspaceId: number, params?: HttpParams): Observable <UnitInListDto[]> {
    return this.http
      .get<UnitInListDto[]>(`${this.serverUrl}workspaces/${workspaceId}/units`, { params: params })
      .pipe(
        catchError(() => [])
      );
  }

  getUsersList(workspaceId: number): Observable <UsersInWorkspaceDto | boolean> {
    return this.http
      .get<UsersInWorkspaceDto>(`${this.serverUrl}workspaces/${workspaceId}/users`)
      .pipe(
        catchError(() => of(false))
      );
  }

  getUnitListWithProperties(workspaceId: number): Observable <UnitPropertiesDto[]> {
    return this.http
      .get<UnitPropertiesDto[]>(`${this.serverUrl}workspaces/${workspaceId}/units/properties`)
      .pipe(
        catchError(() => [])
      );
  }

  addUnit(workspaceId: number, newUnit: CreateUnitDto): Observable<number | null> {
    return this.http
      .post<number>(`${this.serverUrl}workspaces/${workspaceId}/units`, newUnit)
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  deleteUnits(workspaceId: number, units: number[]): Observable<boolean> {
    let queryParams = new HttpParams();
    units.forEach(id => { queryParams = queryParams.append('id', id); });
    return this.http
      .delete(`${this.serverUrl}workspaces/${workspaceId}/units`, { params: queryParams })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  submitUnits(workspaceId: number, dropBoxId: number, units: number[]): Observable<boolean | RequestReportDto> {
    return this.http
      .patch<RequestReportDto>(
      `${this.serverUrl}workspaces/${workspaceId}/units/drop-box-history`, { targetId: dropBoxId, ids: units })
      .pipe(
        catchError(() => of(false))
      );
  }

  returnSubmittedUnits(workspaceId: number, units: number[]): Observable<boolean | RequestReportDto> {
    return this.http
      .patch<RequestReportDto>(
      `${this.serverUrl}workspaces/${workspaceId}/units/drop-box-history`, { ids: units })
      .pipe(
        catchError(() => of(false))
      );
  }

  moveUnits(workspaceId: number,
            units: number[],
            targetWorkspace: number): Observable<boolean | RequestReportDto> {
    return this.http.patch<RequestReportDto>(
      `${this.serverUrl}workspaces/${workspaceId}/units/workspace-id`, { targetId: targetWorkspace, ids: units })
      .pipe(
        catchError(() => of(false))
      );
  }

  copyUnits(workspaceId: number,
            units: number[],
            addComments?: boolean
  ): Observable<boolean | RequestReportDto> {
    return this.http.post<RequestReportDto>(
      `${this.serverUrl}workspaces/${workspaceId}/units`, { ids: units, addComments })
      .pipe(
        catchError(() => of(false))
      );
  }

  downloadUnits(
    workspaceId: number, settings: UnitDownloadSettingsDto
  ): Observable<Blob | number | null> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('download', true);
    queryParams = queryParams.append('settings', JSON.stringify(settings));
    return this.http.get(`${this.serverUrl}workspaces/${workspaceId}`, {
      headers: {
        Accept: 'application/zip'
      },
      params: queryParams,
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

  getCodingBook(workspaceId: number, missingsProfile:string, contentOptions: CodeBookContentSetting,
                unitList:number[]): Observable<Blob | null> {
    if (workspaceId > 0) {
      let queryParams = new HttpParams();
      queryParams = queryParams.append('format', contentOptions.exportFormat);
      queryParams = queryParams.append('missingsProfile', contentOptions.missingsProfile);
      queryParams = queryParams.append('generalInstructions', contentOptions.hasGeneralInstructions);
      queryParams = queryParams.append('onlyManual', contentOptions.hasOnlyManualCoding);
      queryParams = queryParams.append('closed', contentOptions.hasClosedVars);
      queryParams = queryParams.append('derived', contentOptions.hasDerivedVars);
      queryParams = queryParams.append('showScore', contentOptions.showScore);
      queryParams = queryParams.append('codeLabelToUpper', contentOptions.codeLabelToUpper);
      queryParams = queryParams.append('hideItemVarRelation', contentOptions.hideItemVarRelation);
      queryParams = queryParams.append('hasOnlyVarsWithCodes', contentOptions.hasOnlyVarsWithCodes);
      unitList.forEach(id => { queryParams = queryParams.append('id', id); });
      return this.http
        .get(`${this.serverUrl}workspaces/${workspaceId}/units/coding-book`, {
          params: queryParams,
          headers: {
            Accept: 'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          },
          responseType: 'blob'
        })
        .pipe(
          catchError(() => of(null))
        );
    }
    return of(null);
  }

  getUnitProperties(workspaceId: number, unitId: number): Observable<UnitPropertiesDto | null> {
    if (workspaceId > 0 && unitId > 0) {
      return this.http
        .get<UnitPropertiesDto>(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/properties`)
        .pipe(
          catchError(() => of(null))
        );
    }
    return of(null);
  }

  getUnitDefinition(workspaceId: number, unitId: number): Observable<UnitDefinitionDto | null> {
    if (workspaceId > 0 && unitId > 0) {
      return this.http
        .get<UnitDefinitionDto>(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/definition`)
        .pipe(
          catchError(() => of(null))
        );
    }
    return of(null);
  }

  getUnitScheme(workspaceId: number, unitId: number): Observable<UnitSchemeDto | null> {
    if (workspaceId > 0 && unitId > 0) {
      return this.http
        .get<UnitSchemeDto>(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/scheme`)
        .pipe(
          catchError(() => of(null))
        );
    }
    return of(null);
  }

  setUnitProperties(workspaceId: number, unitData: UnitPropertiesDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/units/${unitData.id}/properties`, unitData)
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
      return this.http.post<RequestReportDto>(`${this.serverUrl}workspaces/${workspaceId}`, formData, {
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
      .patch(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/definition`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  setUnitScheme(workspaceId: number, unitId: number, unitData: UnitSchemeDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/units/${unitId}/scheme`, unitData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getReviewList(workspaceId: number): Observable <ReviewInListDto[]> {
    return this.http
      .get<ReviewInListDto[]>(`${this.serverUrl}workspaces/${workspaceId}/reviews`)
      .pipe(
        catchError(() => [])
      );
  }

  getReview(workspaceId: number, reviewId: number): Observable <ReviewFullDto | null> {
    return this.http
      .get<ReviewFullDto>(`${this.serverUrl}workspaces/${workspaceId}/reviews/${reviewId}`)
      .pipe(
        map(r => r),
        catchError(() => of(null))
      );
  }

  setReview(workspaceId: number, reviewId: number, reviewData: ReviewFullDto): Observable<boolean> {
    return this.http
      .patch(`${this.serverUrl}workspaces/${workspaceId}/reviews/${reviewId}`, reviewData)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  addReview(workspaceId: number, newReview: CreateReviewDto): Observable<number | null> {
    return this.http
      .post<number>(`${this.serverUrl}workspaces/${workspaceId}/reviews`, newReview)
      .pipe(
        catchError(() => of(null)),
        map(returnId => Number(returnId))
      );
  }

  deleteReview(workspaceId: number, review: number): Observable<boolean> {
    return this.http
      .delete(`${this.serverUrl}workspaces/${workspaceId}/reviews/${review}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getDirectDownloadLink(): string {
    return `${this.serverUrl}packages/`;
  }

  getUnitGroups(workspaceId: number): Observable <string[]> {
    return this.http
      .get<string[]>(`${this.serverUrl}workspaces/${workspaceId}/groups`)
      .pipe(
        catchError(() => [])
      );
  }

  addUnitGroup(workspaceId: number, newGroup: string): Observable <boolean> {
    return this.http
      .patch(
        `${this.serverUrl}workspaces/${workspaceId}/group-name`,
        { groupName: newGroup }
      )
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  deleteUnitGroup(workspaceId: number, group: string): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}workspaces/${workspaceId}/group-name`,
        { groupName: group, operation: 'remove' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  renameUnitGroup(workspaceId: number, oldGroupName: string, newGroupName: string): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}workspaces/${workspaceId}/group-name`,
        { groupName: oldGroupName, newGroupName: newGroupName, operation: 'rename' })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  setGroupUnits(workspaceId: number, groupName: string, units: number[]): Observable<boolean> {
    return this.http
      .patch(
        `${this.serverUrl}workspaces/${workspaceId}/units/group-name`,
        { name: groupName, ids: units })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getCodingReport(workspaceId: number): Observable<CodingReportDto[] | []> {
    return this.http
      .get<CodingReportDto[]>(`${this.serverUrl}workspaces/${workspaceId}/units/scheme`)
      .pipe(
        catchError(() => of([]))
      );
  }
}
