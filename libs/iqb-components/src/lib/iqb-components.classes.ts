/* eslint-disable max-classes-per-file */
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/** A failed request in the two forms it is needed in: one line for the user, one for the log. */
export class ServerError {
  code: number;
  labelNice: string;
  labelSystem: string;

  constructor(code: number, labelNice: string, labelSystem: string) {
    this.code = code;
    this.labelNice = labelNice;
    this.labelSystem = labelSystem;
  }
}

/** What an application tells this library about itself when it provides the module. */
export class IqbComponentsConfig {
  id: string | undefined;
  name: string | undefined;
}

/**
 * Turns an HTTP failure into a {@link ServerError} with a message a user can read. The three cases
 * worth telling apart are named: no connection at all, not (or no longer) logged in, and a server
 * that reports a database problem. Everything else keeps the general wording.
 *
 * The texts are German literals -- this library predates the studio's translation setup.
 */
export class ErrorHandler {
  /** Never throws: the error is answered as a value, so a caller can render it like any other. */
  static handle(errorObj: HttpErrorResponse): Observable<ServerError> {
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
