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
export class MetadataBackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  getMetadataVocabulariesForProfile(url:string):Observable<MetadataVocabularyDto[] | boolean> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);
    return this.http
      .get(`${this.serverUrl}metadata/vocabularies`, { params: queryParams })
      .pipe(
        map(vocab => vocab as MetadataVocabularyDto[]),
        catchError(() => of(false))
      );
  }

  getMetadataProfile(url:string): Observable<MetadataProfileDto | boolean> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('url', url);

    return this.http
      .get(`${this.serverUrl}metadata/profiles`, { params: queryParams })
      .pipe(
        map(profile => profile as MetadataProfileDto),
        catchError(() => of(false))
      );
  }

  getRegisteredProfiles():Observable<RegisteredMetadataProfileDto[] | boolean> {
    return this.http.get(`${this.serverUrl}metadata/registry`).pipe(
      map(vocab => vocab as RegisteredMetadataProfileDto[]),
      catchError(() => of(false))
    );
  }
}
