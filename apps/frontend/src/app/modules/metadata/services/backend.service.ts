import {
  Inject, Injectable
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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

  saveVocabs(vocabs:any):Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}profile/vocabs`, vocabs)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }

  getVocab(url:string):Observable<any> {
    const shortenedUrl = url.replace(this.baseUrlVocabs, '')
      .replace(/\//g, '');
    return this.http
      .get(`${this.serverUrl}profile/vocab/${shortenedUrl}`)
      .pipe(
        catchError(() => of(false)),
        map(vocab => vocab)
      );
  }

  getProfile(url:string):Observable<any> {
    const shortenedUrl = url.replace(this.baseUrlProfile, '')
      .replace(/\//g, '').replace('.json', '');
    return this.http
      .get(`${this.serverUrl}profile/${shortenedUrl}`)
      .pipe(
        catchError(() => of(false)),
        map(profile => profile)
      );
  }

  saveProfile(profile:any):Observable<any> {
    return this.http
      .post(`${this.serverUrl}profile`, profile)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }
}
