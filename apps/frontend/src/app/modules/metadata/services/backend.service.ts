import {
  Inject, Injectable
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  MetadataProfileDto,
  RegisteredMetadataProfileDto
} from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getMetadataProfile(url:string): Observable<MetadataProfileDto | boolean> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);

    return this.http
      .get(`${this.serverUrl}metadata/profiles`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(profile => profile as MetadataProfileDto)
      );
  }

  getRegisteredProfiles():Observable<RegisteredMetadataProfileDto[] | boolean> {
    return this.http
      .get(`${this.serverUrl}metadata/registry`)
      .pipe(
        catchError(() => of(false)),
        map(vocab => vocab as RegisteredMetadataProfileDto[])
      );
  }
}
