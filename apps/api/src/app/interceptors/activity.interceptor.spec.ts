import { ExecutionContext, CallHandler } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ActivityInterceptor } from './activity.interceptor';
import { UsersService } from '../services/users.service';

describe('ActivityInterceptor', () => {
  let interceptor: ActivityInterceptor;
  let usersService: jest.Mocked<Pick<UsersService, 'updateLastActivity'>>;

  const contextFor = (
    url: string,
    user: { id: number, sessionId: string } | undefined,
    headers: Record<string, string | string[]> = {}
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => createMock<ReturnType<ExecutionContext['switchToHttp']>>({
      getRequest: () => ({ url, user, headers })
    })
  });

  const nextHandler = (): CallHandler => createMock<CallHandler>({
    handle: () => of(null)
  });

  beforeEach(() => {
    usersService = { updateLastActivity: jest.fn().mockResolvedValue(undefined) };
    interceptor = new ActivityInterceptor(usersService as unknown as UsersService);
  });

  it('should count an ordinary authenticated request as activity', () => {
    interceptor.intercept(contextFor('/api/units/1', { id: 1, sessionId: 'sid-1' }), nextHandler());

    expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
  });

  it('should ignore unauthenticated requests', () => {
    interceptor.intercept(contextFor('/api/units/1', undefined), nextHandler());

    expect(usersService.updateLastActivity).not.toHaveBeenCalled();
  });

  // The liveness ping arrives on a timer for as long as a tab is open. Counting it as
  // activity would extend the inactivity window forever and keep a forgotten tab
  // logged in -- which is the whole reason the ping is separate from /activity.
  it('should not count a session ping as activity', () => {
    interceptor.intercept(contextFor('/api/session-ping', { id: 1, sessionId: 'sid-1' }), nextHandler());

    expect(usersService.updateLastActivity).not.toHaveBeenCalled();
  });

  it('should not count a token refresh as activity', () => {
    interceptor.intercept(contextFor('/api/refresh', { id: 1, sessionId: 'sid-1' }), nextHandler());

    expect(usersService.updateLastActivity).not.toHaveBeenCalled();
  });

  it('should not count the activity endpoint itself twice', () => {
    interceptor.intercept(contextFor('/api/activity', { id: 1, sessionId: 'sid-1' }), nextHandler());

    expect(usersService.updateLastActivity).not.toHaveBeenCalled();
  });

  describe('the admin users poll', () => {
    it('should not count as activity without an explicit intent header', () => {
      interceptor.intercept(
        contextFor('/api/group-admin/users', { id: 1, sessionId: 'sid-1' }),
        nextHandler()
      );

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });

    it('should count as activity when flagged as user intent', () => {
      interceptor.intercept(
        contextFor('/api/group-admin/users', { id: 1, sessionId: 'sid-1' }, { 'x-activity-intent': 'user' }),
        nextHandler()
      );

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
    });

    it('should accept the intent flag from a repeated header', () => {
      interceptor.intercept(
        contextFor('/api/group-admin/users', { id: 1, sessionId: 'sid-1' }, { 'x-activity-intent': ['other', 'user'] }),
        nextHandler()
      );

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
    });
  });

  it('should pass the request through', done => {
    interceptor.intercept(contextFor('/api/units/1', { id: 1, sessionId: 'sid-1' }), nextHandler())
      .subscribe(() => done());
  });
});
