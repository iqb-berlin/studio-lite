import { HttpErrorResponse } from '@angular/common/http';
import { isNoAnswer, isNoAnswerStatus } from './no-answer.utils';

// A missing answer keeps the login; a verdict of the server, or the call to reload, does not (#2112).
describe('isNoAnswer', () => {
  it.each([0, 500, 502, 503, 504])('takes status %s for no answer', status => {
    expect(isNoAnswer(new HttpErrorResponse({ status }))).toBe(true);
  });

  it.each([401, 403, 404, 521])('takes status %s for an answer', status => {
    expect(isNoAnswer(new HttpErrorResponse({ status }))).toBe(false);
  });

  it('takes an error that did not come from a request for an answer', () => {
    expect(isNoAnswer(new Error('Refresh failed'))).toBe(false);
  });

  // The status the error messages carry for a request that never reached the server.
  it('takes the status of an unsent request for no answer', () => {
    expect(isNoAnswerStatus(999)).toBe(true);
  });
});
