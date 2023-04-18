import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  VeronaModuleInListDto,
  VeronaModuleFileDto
} from '@studio-lite-lib/api-dto';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) { }

  getModuleList(type?: string): Observable<VeronaModuleInListDto[]> {
    return this.http
      .get<VeronaModuleInListDto[]>(`${this.serverUrl}verona-modules${type ? `?type=${type}` : ''}`)
      .pipe(
        catchError(() => of(<VeronaModuleInListDto[]>[]))
      );
  }

  getModuleHtml(moduleId: string): Observable<VeronaModuleFileDto | null> {
    return this.http
      .get<VeronaModuleFileDto>(`${this.serverUrl}verona-module/${moduleId}`)
      .pipe(
        catchError(() => of(null))
      );
  }
}
