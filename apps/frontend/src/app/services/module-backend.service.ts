import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  VeronaModuleInListDto,
  VeronaModuleFileDto
} from '@studio-lite-lib/api-dto';

/**
 * The two module routes: the list, and a module's HTML. Kept apart from {@link ModuleService},
 * which holds what has been loaded, so the caching and the fetching do not share a class.
 */
@Injectable({
  providedIn: 'root'
})
export class ModuleBackendService {
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
      .get<VeronaModuleFileDto>(`${this.serverUrl}verona-modules/${moduleId}`)
      .pipe(
        catchError(() => of(null))
      );
  }
}
