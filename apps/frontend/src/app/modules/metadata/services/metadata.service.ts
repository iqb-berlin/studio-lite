import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { MDProfileGroup } from '@iqb/metadata';
import { WorkspaceService } from '../../workspace/services/workspace.service';

@Injectable({
  providedIn: 'root'
})

export class MetadataService {
  constructor(@Inject('SERVER_URL') private readonly serverUrl: string,
              private workspaceService: WorkspaceService,
              private http: HttpClient) {
  }

  unitProfileColumns:MDProfileGroup[] = [];
  itemProfileColumns:MDProfileGroup = {} as MDProfileGroup;

  downloadMetadataReport(type: string, columns: string[], units: number[]): Observable<Blob> {
    const queryParams = new HttpParams()
      .set('type', type)
      .appendAll({
        column: columns,
        id: units
      });

    const url = `${this.serverUrl}workspaces/${this.workspaceService.selectedWorkspaceId}/units/properties`;

    return this.http.get<Blob>(url, {
      headers: { Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      params: queryParams,
      responseType: 'blob' as 'json'
    });
  }

  createMetadataReport(): Observable<boolean | UnitPropertiesDto[]> {
    return this.http
      // eslint-disable-next-line max-len
      .get<UnitPropertiesDto[]>(`${this.serverUrl}workspaces/${this.workspaceService.selectedWorkspaceId}/units/properties`)
      .pipe(
        catchError(() => of(false)),
        map(report => report)
      );
  }
}
