import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { of } from 'rxjs';
import { ActivityInterceptor } from './activity.interceptor';
import { UsersService } from '../services/users.service';
import { AppController } from '../controllers/app.controller';
import { GroupAdminUserController } from '../controllers/group-admin-user-controller';
import { BACKGROUND_REQUEST_KEY } from '../decorators/background-request.decorator';

/**
 * The unit test for this interceptor mocks the Reflector, so it says nothing about two
 * things that can only fail outside it: whether the container can build the interceptor at
 * all now that it takes a Reflector, and whether the production routes carry the markings
 * the interceptor expects. Both were invisible to unit tests in #1569 as well -- the
 * missing exemption for the session ping only surfaced against a running API.
 *
 * So this runs the real Reflector against the real controller methods.
 */
describe('ActivityInterceptor (integration)', () => {
  let interceptor: ActivityInterceptor;
  let usersService: { updateLastActivity: jest.Mock };

  beforeEach(async () => {
    usersService = { updateLastActivity: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ActivityInterceptor,
        { provide: UsersService, useValue: usersService }
      ]
    }).compile();

    interceptor = moduleRef.get(ActivityInterceptor);
  });

  // Resolving from the container is the assertion: a Reflector that cannot be injected
  // would make the whole application fail to bootstrap.
  it('should be constructible by the DI container', () => {
    expect(interceptor).toBeInstanceOf(ActivityInterceptor);
  });

  describe('the markings on the production routes', () => {
    const reflector = new Reflector();
    const modeOf = (handler: unknown, controller: unknown): string | undefined => reflector
      .getAllAndOverride<string | undefined>(
      BACKGROUND_REQUEST_KEY,
      [handler as () => void, controller as new () => unknown]
    );

    it.each([
      ['refresh', AppController.prototype.refresh],
      ['logout', AppController.prototype.logout],
      ['logoutSilent', AppController.prototype.logoutSilent],
      ['activity', AppController.prototype.activity]
    ])('should mark %s as always background', (_name, handler) => {
      expect(modeOf(handler, AppController)).toBe('always');
    });

    it('should mark the polled user list as background unless intent is declared', () => {
      expect(modeOf(GroupAdminUserController.prototype.findAll, GroupAdminUserController))
        .toBe('unless-user-intent');
    });

    // The routes that the old substring list caught by accident: saving and reading a
    // user's workspace assignments is interaction and must carry no marking (#1517).
    it.each([
      ['patchOnesWorkspaces', GroupAdminUserController.prototype.patchOnesWorkspaces],
      ['findOnesWorkspaces', GroupAdminUserController.prototype.findOnesWorkspaces]
    ])('should leave %s unmarked', (_name, handler) => {
      expect(modeOf(handler, GroupAdminUserController)).toBeUndefined();
    });

    it('should leave an ordinary route unmarked', () => {
      expect(modeOf(AppController.prototype.login, AppController)).toBeUndefined();
    });
  });

  describe('driving the real interceptor over real handlers', () => {
    // Built by hand rather than with createMock: the context has to return the real
    // handler function, and a mock cannot express a method whose return value is itself a
    // function. Same pattern the decorator specs in this repo use.
    const contextFor = (
      handler: unknown,
      controller: unknown,
      headers: Record<string, string> = {}
    ): ExecutionContext => ({
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: 7, sessionId: 'sid-7' }, headers })
      })
    } as unknown as ExecutionContext);

    const next = (): CallHandler => createMock<CallHandler>({ handle: () => of(null) });

    it('should not record activity for the activity sync itself', () => {
      interceptor.intercept(contextFor(AppController.prototype.activity, AppController), next());

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });

    it('should record activity for saving workspace assignments', () => {
      interceptor.intercept(
        contextFor(GroupAdminUserController.prototype.patchOnesWorkspaces, GroupAdminUserController),
        next()
      );

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(7, 'sid-7');
    });

    it('should not record activity for the polled user list', () => {
      interceptor.intercept(
        contextFor(GroupAdminUserController.prototype.findAll, GroupAdminUserController),
        next()
      );

      expect(usersService.updateLastActivity).not.toHaveBeenCalled();
    });

    it('should record activity for the user-triggered list refresh', () => {
      interceptor.intercept(
        contextFor(
          GroupAdminUserController.prototype.findAll,
          GroupAdminUserController,
          { 'x-activity-intent': 'user' }
        ),
        next()
      );

      expect(usersService.updateLastActivity).toHaveBeenCalledWith(7, 'sid-7');
    });
  });
});
