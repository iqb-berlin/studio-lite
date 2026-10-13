import { HttpErrorResponse } from '@angular/common/http';
import { isAutomationDetected } from '@iqb/gate-angular';
import { HUMAN_VERIFICATION_REQUIRED_STATUS } from '@iqb/gate-protocol';

/**
 * Why the gateway in front of the studio (iqb-gate) let a request not through: the browser reported
 * automation, or the person was not confirmed as one: the challenge was cancelled, or the write was
 * asked for one again right after it was solved (a burst of them).
 */
export type GateRejection = 'automation-detected' | 'not-verified';

/** The gateway's reason for an error, or `null` for any other error -- one the studio answered. */
export function gateRejectionOf(error: unknown): GateRejection | null {
  if (isAutomationDetected(error)) return 'automation-detected';
  if (error instanceof HttpErrorResponse && error.status === HUMAN_VERIFICATION_REQUIRED_STATUS) {
    return 'not-verified';
  }
  return null;
}
