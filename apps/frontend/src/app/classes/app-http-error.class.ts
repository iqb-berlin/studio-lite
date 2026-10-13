import { HttpErrorResponse } from '@angular/common/http';
import { GateRejection, gateRejectionOf } from '../utils/gate-rejection';

/** The statuses whose message offers to log in again. */
const LOGIN_STATUSES = [401, 403, 410];

/**
 * A failed request in the form the error display needs it: status, message, and which call it was.
 * A failure with no response at all -- no connection -- is given the status 999, so it can be told
 * apart from anything the server actually answered.
 *
 * The message is translated under `app-http-error.<key>`. The key is the status, except for a save
 * the gateway (iqb-gate) did not let through (`gateRejectionOf`): its rejection has a message of its
 * own, and logging in again would not help.
 */
export class AppHttpError {
  status = 0;
  key = '';
  offersLogin = false;
  message: string;
  method = '';
  urlWithParams = '';
  id = 0;
  private readonly answeredStatus: number;
  private readonly gateRejection: GateRejection | null;

  constructor(errorObj: HttpErrorResponse) {
    this.message = errorObj.error instanceof ErrorEvent ? (<ErrorEvent>errorObj.error).message : errorObj.message;
    this.answeredStatus = errorObj.error instanceof ErrorEvent ? 999 : errorObj.status;
    this.gateRejection = gateRejectionOf(errorObj);
    this.setStatus(this.answeredStatus);
  }

  setStatus(status: number): void {
    this.status = status;
    // The gateway's reason belongs to the status it answered with; one set later is the studio's own
    const gateRejection = status === this.answeredStatus ? this.gateRejection : null;
    this.key = gateRejection ?? `${status}`;
    this.offersLogin = !gateRejection && LOGIN_STATUSES.includes(status);
  }
}
