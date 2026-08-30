import { HttpErrorResponse } from '@angular/common/http';

/**
 * A failed request in the form the error display needs it: status, message, and which call it was.
 * A failure with no response at all -- no connection -- is given the status 999, so it can be told
 * apart from anything the server actually answered.
 */
export class AppHttpError {
  status: number;
  message: string;
  method = '';
  urlWithParams = '';
  id = 0;

  constructor(errorObj: HttpErrorResponse) {
    this.status = errorObj.error instanceof ErrorEvent ? 999 : errorObj.status;
    this.message = errorObj.error instanceof ErrorEvent ? (<ErrorEvent>errorObj.error).message : errorObj.message;
  }
}
