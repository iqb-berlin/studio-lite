import {
  Inject, Injectable
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  MetadataProfileDto,
  MetadataVocabularyDto,
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

  getMetadataVocabulariesForProfile(url:string):Observable<MetadataVocabularyDto[] | boolean> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);
    return this.http
      .get(`${this.serverUrl}metadata-profile/vocabularies`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(vocab => vocab as MetadataVocabularyDto[])
      );
  }

  getMetadataProfile(url:string): Observable<MetadataProfileDto | boolean> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);

    return this.http
      .get(`${this.serverUrl}metadata-profile`, { params: queryParams })
      .pipe(
        catchError(() => of(false)),
        map(profile => profile as MetadataProfileDto)
      );
  }

  getRegisteredProfiles():Observable<RegisteredMetadataProfileDto[] | boolean> {
    return this.http
      .get(`${this.serverUrl}metadata-profile/registry`)
      .pipe(
        catchError(() => of(false)),
        map(vocab => vocab as RegisteredMetadataProfileDto[])
      );
  }
}
