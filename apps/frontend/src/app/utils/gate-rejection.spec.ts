import { HttpErrorResponse } from '@angular/common/http';
import { gateRejectionOf } from './gate-rejection';

describe('gateRejectionOf', () => {
  const httpError = (status: number, error: unknown = null) => new HttpErrorResponse({ status, error });

  it('should name a request rejected because the browser reported automation', () => {
    expect(gateRejectionOf(httpError(403, { code: 'automation-detected', signals: ['webdriver'] })))
      .toBe('automation-detected');
  });

  it('should name a request that was not confirmed as a person\'s', () => {
    expect(gateRejectionOf(httpError(428, { code: 'human-verification-required' }))).toBe('not-verified');
  });

  it('should leave every other error to the studio', () => {
    expect(gateRejectionOf(httpError(403, { message: 'Forbidden' }))).toBeNull();
    expect(gateRejectionOf(httpError(401))).toBeNull();
    expect(gateRejectionOf(httpError(0))).toBeNull();
    expect(gateRejectionOf(new Error('no response'))).toBeNull();
  });
});
