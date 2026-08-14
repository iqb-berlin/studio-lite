import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ActivityInterceptor } from './activity.interceptor';
import { UsersService } from '../services/users.service';
import { BACKGROUND_REQUEST_KEY, BackgroundRequestMode } from '../decorators/background-request.decorator';

describe('ActivityInterceptor', () => {
  let interceptor: ActivityInterceptor;
  let usersService: jest.Mocked<Pick<UsersService, 'updateLastActivity'>>;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;

  const contextFor = (
    user: { id: number, sessionId: string } | undefined,
    headers: Record<string, string | string[]> = {}
  ): ExecutionContext => createMock<ExecutionContext>({
    switchToHttp: () => createMock<ReturnType<ExecutionContext['switchToHttp']>>({
      getRequest: () => ({ user, headers })
    })
  });

  const nextHandler = (): CallHandler => createMock<CallHandler>({ handle: () => of(null) });

  // What the route marking says. undefined = the route carries no marking at all.
  const markedAs = (mode: BackgroundRequestMode | undefined): void => {
    reflector.getAllAndOverride.mockReturnValue(mode);
  };

  beforeEach(() => {
    usersService = { updateLastActivity: jest.fn().mockResolvedValue(undefined) };
    reflector = { getAllAndOverride: jest.fn() };
    interceptor = new ActivityInterceptor(
      usersService as unknown as UsersService,
      reflector as unknown as Reflector
    );
  });

  const user = { id: 1, sessionId: 'sid-1' };

  // Both targets are passed so a whole controller can be marked; the handler wins.
  it('should look the marking up on the handler and the controller', () => {
    markedAs(undefined);

    interceptor.intercept(contextFor(user), nextHandler());

    const [key, targets] = reflector.getAllAndOverride.mock.calls[0];
    expect(key).toBe(BACKGROUND_REQUEST_KEY);
    expect(targets).toHaveLength(2);
  });

  // An unmarked route is interaction. This is the direction that matters: forgetting a
  // marking makes a background request count, which is visible, rather than silently
  // exempting a route nobody meant to exempt.
  it('should count an unmarked route as activity', () => {
    markedAs(undefined);

    interceptor.intercept(contextFor(user), nextHandler());

    expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
  });

  it('should ignore unauthenticated requests', () => {
    markedAs(undefined);

    interceptor.intercept(contextFor(undefined), nextHandler());

    expect(usersService.updateLastActivity).not.toHaveBeenCalled();
  });

  describe("a route marked 'always'", () => {
    it('should never count as activity', () => {
      markedAs('always');

      interceptor.intercept(contextFor(user), nextHandler());

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });

    // A claimed intent must not be able to turn the liveness ping or a token refresh into
    // interaction -- that would be the forgotten-open-tab-lives-forever bug from #1569.
    it('should not count even when the caller claims user intent', () => {
      markedAs('always');

      interceptor.intercept(contextFor(user, { 'x-activity-intent': 'user' }), nextHandler());

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });
  });

  describe("a route marked 'unless-user-intent'", () => {
    it('should not count without an intent header', () => {
      markedAs('unless-user-intent');

      interceptor.intercept(contextFor(user), nextHandler());

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });

    it('should count when the request declares user intent', () => {
      markedAs('unless-user-intent');

      interceptor.intercept(contextFor(user, { 'x-activity-intent': 'user' }), nextHandler());

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
    });

    it('should accept the intent flag from a repeated header', () => {
      markedAs('unless-user-intent');

      interceptor.intercept(contextFor(user, { 'x-activity-intent': ['other', 'user'] }), nextHandler());

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(1, 'sid-1');
    });

    it('should ignore an intent header with another value', () => {
      markedAs('unless-user-intent');

      interceptor.intercept(contextFor(user, { 'x-activity-intent': 'poll' }), nextHandler());

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });
  });

  it('should pass the request through', done => {
    markedAs(undefined);
    interceptor.intercept(contextFor(user), nextHandler()).subscribe(() => done());
  });
});
