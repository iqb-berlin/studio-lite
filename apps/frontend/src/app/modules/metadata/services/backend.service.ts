import {
  Inject, Injectable
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MetadataProfileDto } from '@studio-lite-lib/api-dto';
import { Vocab, VocabData } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) {}

  private baseUrlVocabs = 'https://w3id.org/iqb/';
  private baseUrlProfile = 'https://raw.githubusercontent.com/iqb-vocabs/';

  saveVocabs(vocabs: Vocab[]):Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}profile/vocabs`, vocabs)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getVocab(url:string):Observable<VocabData | boolean> {
    const shortenedUrl = url.replace(this.baseUrlVocabs, '')
      .replace(/\//g, '');
    return this.http
      .get(`${this.serverUrl}profile/vocab/${shortenedUrl}`)
      .pipe(
        catchError(() => of(false)),
        map(vocab => vocab)
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
}
