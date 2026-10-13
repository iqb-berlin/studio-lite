import { HttpErrorResponse } from '@angular/common/http';
import { AppHttpError } from './app-http-error.class';

describe('AppHttpError', () => {
  it('should map ErrorEvent to status 999 and message', () => {
    const errorEvent = new ErrorEvent('NetworkError', { message: 'Network down' });
    const response = new HttpErrorResponse({
      error: errorEvent,
      status: 0,
      statusText: 'Unknown Error',
      url: '/api/test'
    });

    const appError = new AppHttpError(response);

    expect(appError.status).toBe(999);
    expect(appError.message).toBe('Network down');
  });

  it('should map non-ErrorEvent to http status and message', () => {
    const response = new HttpErrorResponse({
      error: 'Not Found',
      status: 404,
      statusText: 'Not Found',
      url: '/api/missing'
    });

    const appError = new AppHttpError(response);

    expect(appError.status).toBe(404);
    expect(appError.message).toBe(response.message);
  });

  it('should translate a status under its own number and offer to log in again for 401, 403 and 410', () => {
    const appError = new AppHttpError(new HttpErrorResponse({ error: {}, status: 401 }));

    expect(appError.key).toBe('401');
    expect(appError.offersLogin).toBe(true);
    expect(new AppHttpError(new HttpErrorResponse({ error: {}, status: 500 })).offersLogin).toBe(false);
  });

  // The gateway (iqb-gate) rejects a save from an automated browser with a 403 of its own
  it('should give a rejection for automation its own message, without the login', () => {
    const appError = new AppHttpError(new HttpErrorResponse({
      error: { statusCode: 403, code: 'automation-detected', signals: ['webdriver'] },
      status: 403
    }));

    expect(appError.status).toBe(403);
    expect(appError.key).toBe('automation-detected');
    expect(appError.offersLogin).toBe(false);
  });

  it('should give a write that was not confirmed as a person\'s its own message, without the login', () => {
    const appError = new AppHttpError(new HttpErrorResponse({
      error: { statusCode: 428, code: 'human-verification-required' },
      status: 428
    }));

    expect(appError.status).toBe(428);
    expect(appError.key).toBe('not-verified');
    expect(appError.offersLogin).toBe(false);
  });

  it('should drop the reason of the gateway once the status is changed', () => {
    const appError = new AppHttpError(new HttpErrorResponse({
      error: { statusCode: 403, code: 'automation-detected', signals: ['webdriver'] },
      status: 403
    }));

    appError.setStatus(401);

    expect(appError.key).toBe('401');
    expect(appError.offersLogin).toBe(true);
  });

  it('should take any other 403 for a missing permission', () => {
    const appError = new AppHttpError(new HttpErrorResponse({ error: { statusCode: 403 }, status: 403 }));

    expect(appError.key).toBe('403');
    expect(appError.offersLogin).toBe(true);
  });

  it('should keep status, key and login together when the status is changed', () => {
    const appError = new AppHttpError(new HttpErrorResponse({ error: {}, status: 401 }));

    appError.setStatus(403);

    expect(appError.status).toBe(403);
    expect(appError.key).toBe('403');
    expect(appError.offersLogin).toBe(true);
  });
});
