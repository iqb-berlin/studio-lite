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
});
