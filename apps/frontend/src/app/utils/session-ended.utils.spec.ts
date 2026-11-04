import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SESSION_ENDED_MESSAGE } from '@studio-lite/shared-code';
import { isSessionEnded } from './session-ended.utils';

// A token refused because its session ended is no expired token and no missing permission (#2115).
describe('isSessionEnded', () => {
  const answer = (status: number, error: unknown) => firstValueFrom(
    isSessionEnded(new HttpErrorResponse({ status, error }))
  );

  it('recognises the 401 of an ended session', async () => {
    expect(await answer(401, { statusCode: 401, message: SESSION_ENDED_MESSAGE })).toBe(true);
  });

  // A download expects a file, and its error arrives as a Blob.
  it('recognises it in the answer to a request for a file', async () => {
    const body = new Blob([JSON.stringify({ statusCode: 401, message: SESSION_ENDED_MESSAGE })]);
    expect(await answer(401, body)).toBe(true);
  });

  it('takes the 401 of an expired token for something else', async () => {
    expect(await answer(401, { statusCode: 401, message: 'Unauthorized' })).toBe(false);
  });

  it('takes a file answer that is no JSON for something else', async () => {
    expect(await answer(401, new Blob(['<html>Unauthorized</html>']))).toBe(false);
  });

  it('looks at a 401 only', async () => {
    expect(await answer(403, { statusCode: 403, message: SESSION_ENDED_MESSAGE })).toBe(false);
  });
});
