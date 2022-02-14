// eslint-disable-next-line max-classes-per-file
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthDataDto, ChangePasswordDto, ConfigFullDto } from '@studio-lite-lib/api-dto';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private appService: AppService,
    private http: HttpClient
  ) { }

  login(name: string, password: string) {
    const queryParams = new HttpParams()
      .set('username', name)
      .set('password', password);
    return this.http.post<string>(`${this.serverUrl}login?${queryParams.toString()}`, 'jojo')
      .pipe(
        switchMap(loginToken => {
          localStorage.setItem('id_token', loginToken);
          return this.getAuthData()
            .pipe(
              map(authData => {
                this.appService.authData = authData;
              })
            );
        })
      );
  }

  getAuthData(): Observable<AuthDataDto> {
    return this.http.get<AuthDataDto>(`${this.serverUrl}auth-data`);
  }

  logout(): void {
    localStorage.removeItem('id_token');
    this.appService.authData = AppService.defaultAuthData;
  }

  getConfig(): Observable<ConfigFullDto | null> {
    return this.http
      .get<ConfigFullDto | null>(`${this.serverUrl}admin/settings/config`, {})
      .pipe(
        catchError(() => of(null))
      );
  }

  setUserPassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.http
      .patch<boolean>(`${this.serverUrl}password`,
      <ChangePasswordDto>{ oldPassword: oldPassword, newPassword: newPassword })
      .pipe(
        catchError(() => of(false))
      );
  }
}
