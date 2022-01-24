import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from "rxjs";
import {catchError, shareReplay, map, switchMap} from "rxjs/operators";
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from "@angular/common/http";
import {AppHttpError, LoginData, LoginStatusResponseData} from "./backend.service";
import {AuthDataDto} from "@studio-lite-lib/api-start";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public static defaultAuthData = <AuthDataDto>{
    userId: 0,
    userName: 'unbekannt',
    isAdmin: false,
    workspaces: []
  }
  public authData = AuthService.defaultAuthData;
  constructor(
    @Inject('SERVER_URL') private readonly serverUrl: string,
    private http: HttpClient
  ) { }

  login(name: string, password: string) {
    const queryParams = new HttpParams()
      .set('username', name)
      .set('password', password);
    return this.http.post<string>(`${this.serverUrl}login?${queryParams.toString()}`, 'jojo')
      .pipe(
        switchMap(loginToken => {
          localStorage.setItem("id_token", loginToken);
          return this.getAuthData()
            .pipe(
              map(authData => {
                this.authData = authData;
                return
              })
            );
        })
      )
  }

  getAuthData(): Observable<AuthDataDto> {
    return this.http.get<AuthDataDto>(`${this.serverUrl}auth-data`)
  }

  logout(): void {
    localStorage.removeItem("id_token");
    this.authData = AuthService.defaultAuthData;
  }
}
