import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { AppService } from './app.service';
import { AppHttpError } from '../classes/app-http-error.class';

describe('AppService', () => {
  const httpError = (
    status: number,
    message: string,
    urlWithParams: string,
    body: unknown = null,
    id = 0
  ): AppHttpError => {
    const error = new AppHttpError(new HttpErrorResponse({ status, error: body }));
    error.id = id;
    error.message = message;
    error.method = 'GET';
    error.urlWithParams = urlWithParams;
    return error;
  };

  let service: AppService;

  beforeEach(() => {
    const titleServiceMock = {
      setTitle: jest.fn(),
      getTitle: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AppService,
        { provide: Title, useValue: titleServiceMock }
      ]
    });

    service = TestBed.inject(AppService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('defaultAuthData', () => {
    it('should have correct default values', () => {
      expect(AppService.defaultAuthData).toEqual({
        userId: 0,
        userName: '',
        userLongName: '',
        isAdmin: false,
        workspaces: [],
        reviews: []
      });
    });
  });

  describe('authData getter and setter', () => {
    it('should return default authData initially', () => {
      expect(service.authData).toEqual(AppService.defaultAuthData);
    });

    it('should emit authDataChanged event when authData is set', done => {
      const testAuthData: AuthDataDto = {
        userId: 456,
        userName: 'anotherUser',
        userLongName: 'Another User',
        isAdmin: false,
        workspaces: [],
        reviews: []
      };

      service.authDataChanged.subscribe((data: AuthDataDto) => {
        expect(data).toEqual(testAuthData);
        done();
      });

      service.authData = testAuthData;
    });
  });

  describe('processMessagePost', () => {
    it('should emit postMessage$ when message has type', done => {
      const testMessage = {
        data: { type: 'test-type', payload: 'test-payload' }
      } as MessageEvent;

      service.postMessage$.subscribe((msg: MessageEvent) => {
        expect(msg).toEqual(testMessage);
        done();
      });

      service.processMessagePost(testMessage);
    });

    it('should not emit postMessage$ when message type is undefined', done => {
      const testMessage = {
        data: { payload: 'test-payload' }
      } as MessageEvent;

      let emitted = false;
      service.postMessage$.subscribe(() => {
        emitted = true;
      });

      service.processMessagePost(testMessage);

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 50);
    });

    it('should not emit postMessage$ when message type is null', done => {
      const testMessage = {
        data: { type: null, payload: 'test-payload' }
      } as MessageEvent;

      let emitted = false;
      service.postMessage$.subscribe(() => {
        emitted = true;
      });

      service.processMessagePost(testMessage);

      setTimeout(() => {
        expect(emitted).toBe(false);
        done();
      }, 50);
    });
  });

  describe('isWorkspaceGroupAdmin', () => {
    it('should return false when user has no workspaces', () => {
      service.authData = {
        ...AppService.defaultAuthData,
        workspaces: []
      };
      expect(service.isWorkspaceGroupAdmin(1)).toBe(false);
    });

    it('should return true when user is admin of workspace group', () => {
      service.authData = {
        ...AppService.defaultAuthData,
        workspaces: [{
          id: 1,
          name: 'Group 1',
          isAdmin: true,
          workspaces: [{
            id: 100,
            name: 'Workspace 100',
            userAccessLevel: 2
          }]
        }]
      };
      expect(service.isWorkspaceGroupAdmin(100)).toBe(true);
    });

    it('should return false when user is not admin of workspace group', () => {
      service.authData = {
        ...AppService.defaultAuthData,
        workspaces: [{
          id: 1,
          name: 'Group 1',
          isAdmin: false,
          workspaces: [{
            id: 200,
            name: 'Workspace 200',
            userAccessLevel: 1
          }]
        }]
      };
      expect(service.isWorkspaceGroupAdmin(200)).toBe(false);
    });

    it('should return false for non-existent workspace', () => {
      service.authData = {
        ...AppService.defaultAuthData,
        workspaces: [{
          id: 1,
          name: 'Group 1',
          isAdmin: true,
          workspaces: [{
            id: 300,
            name: 'Workspace 300',
            userAccessLevel: 2
          }]
        }]
      };
      expect(service.isWorkspaceGroupAdmin(999)).toBe(false);
    });
  });

  describe('addErrorMessage', () => {
    it('should add error message when not disabled', () => {
      const error = httpError(500, 'Test message', '/test');

      service.addErrorMessage(error);
      expect(service.errorMessages.length).toBe(1);
      expect(service.errorMessages[0].message).toBe('Test message');
    });

    it('should not add error message when disabled', () => {
      service.errorMessagesDisabled = true;
      const error = httpError(500, 'Test message', '/test');

      service.addErrorMessage(error);
      expect(service.errorMessages.length).toBe(0);
    });

    it('should combine messages for errors with same status', () => {
      const error1 = httpError(404, 'Message 1', '/test1');
      const error2 = httpError(404, 'Message 2', '/test2');

      service.addErrorMessage(error1);
      service.addErrorMessage(error2);

      expect(service.errorMessages.length).toBe(1);
      expect(service.errorMessages[0].message).toBe('Message 1; Message 2');
    });

    it('should keep a rejection for automation apart from a missing permission', () => {
      service.addErrorMessage(httpError(403, 'Forbidden', '/test1'));
      service.addErrorMessage(httpError(403, 'Automated', '/test2', { code: 'automation-detected' }));

      expect(service.errorMessages.map(e => e.key)).toEqual(['403', 'automation-detected']);
    });

    it('should increment errorMessageCounter for new errors', () => {
      const initialCounter = service.errorMessageCounter;
      const error = httpError(500, 'Test message', '/test');

      service.addErrorMessage(error);
      expect(service.errorMessageCounter).toBe(initialCounter + 1);
    });

    it('should assign id to error message', () => {
      const error = httpError(500, 'Test message', '/test');

      service.addErrorMessage(error);
      expect(service.errorMessages[0].id).toBeGreaterThan(0);
    });
  });

  describe('removeErrorMessage', () => {
    it('should remove error message by id', () => {
      const error1 = httpError(404, 'Message 1', '/test1', null, 1);
      const error2 = httpError(500, 'Message 2', '/test2', null, 2);

      service.errorMessages = [error1, error2];
      service.removeErrorMessage(error1);

      expect(service.errorMessages.length).toBe(1);
      expect(service.errorMessages[0].id).toBe(2);
    });

    it('should do nothing if error id not found', () => {
      const error1 = httpError(404, 'Message 1', '/test1', null, 1);
      const error2 = httpError(500, 'Message 2', '/test2', null, 999);

      service.errorMessages = [error1];
      service.removeErrorMessage(error2);

      expect(service.errorMessages.length).toBe(1);
      expect(service.errorMessages[0].id).toBe(1);
    });
  });
});
