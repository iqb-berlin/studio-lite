import { HttpErrorResponse } from '@angular/common/http';

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
