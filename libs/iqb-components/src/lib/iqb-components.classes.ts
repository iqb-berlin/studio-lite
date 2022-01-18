/* eslint-disable max-classes-per-file */
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export class ServerError {
  public code: number;
  public labelNice: string;
  public labelSystem: string;

  constructor(code: number, labelNice: string, labelSystem: string) {
    this.code = code;
    this.labelNice = labelNice;
    this.labelSystem = labelSystem;
  }
}

export class IqbComponentsConfig {
  public id: string | undefined;
  public name: string | undefined;
}

export class ErrorHandler {
  public static handle(errorObj: HttpErrorResponse): Observable<ServerError> {
    let myReturn: ServerError;

    if (errorObj.error instanceof ErrorEvent) {
      myReturn = new ServerError(500, 'Verbindungsproblem', errorObj.message);
    } else {
      myReturn = new ServerError(errorObj.status, 'Verbindungsproblem', errorObj.message);
      if (errorObj.status === 401) {
        myReturn.labelNice = 'Zugriff verweigert - bitte (neu) anmelden!';
      } else if (errorObj.status === 503) {
        myReturn.labelNice = 'Achtung: Server meldet Datenbankproblem.';
      }
    }

    return of(myReturn);
  }
}
