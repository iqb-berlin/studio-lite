import {
  Inject, Injectable
} from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { MDProfile } from '@iqb/metadata/md-profile';
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

  getProfile(url:string):Observable<MDProfile | boolean> {
    const shortenedUrl = url.replace(this.baseUrlProfile, '')
      .replace(/\//g, '').replace('.json', '');
    return this.http
      .get(`${this.serverUrl}profile/${shortenedUrl}`)
      .pipe(
        catchError(() => of(false)),
        map(profile => profile as MDProfile)
      );
  }

  saveProfile(profile:MDProfile):Observable<boolean> {
    return this.http
      .post(`${this.serverUrl}profile`, profile)
      .pipe(
        catchError(() => of(false)),
        map(() => true)
      );
  }
}
