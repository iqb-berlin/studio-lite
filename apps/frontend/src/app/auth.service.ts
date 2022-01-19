import {Inject, Injectable} from '@angular/core';
import {Observable, of, throwError} from "rxjs";
import {catchError, shareReplay, map} from "rxjs/operators";
import {HttpClient, HttpErrorResponse, HttpParams} from "@angular/common/http";
import {AppHttpError, LoginData, LoginStatusResponseData} from "./backend.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) { }

  login(name: string, password: string) {
    const queryParams = new HttpParams()
      .set('username', name)
      .set('password', password);
    return this.http.post<string>(`${this.serverUrl}login?${queryParams.toString()}`, undefined)
      .pipe(
        shareReplay(),
        map((token: string) => {
          localStorage.setItem("id_token", token);
        })
      )
  }

  logout(): Observable<boolean> {
    return this.http
      .put<boolean>(`${this.serverUrl}logout.php`, { t: localStorage.getItem('t') })
      .pipe(
        catchError(() => of(false))
      );
  }
}
