import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { LoginAgainDirective } from './login-again.directive';
import { BackendService } from '../services/backend.service';
import { AppService } from '../services/app.service';
import { LanguageUrlSerializer } from '../services/language-url-serializer';
import { LanguageService } from '../services/language.service';

describe('LoginAgainDirective', () => {
  let backendService: DeepMocked<BackendService>;
  let appService: DeepMocked<AppService>;
  let router: {
    routerState: { snapshot: { url: string } },
    navigate: jest.Mock,
    parseUrl: (url: string) => UrlTree
  };

  beforeEach(() => {
    backendService = createMock<BackendService>();
    appService = createMock<AppService>();
    router = {
      routerState: { snapshot: { url: '' } },
      navigate: jest.fn().mockResolvedValue(true),
      // The router reads urls through the serializer of the app, which knows the language prefixes.
      parseUrl: url => TestBed.inject(LanguageUrlSerializer).parse(url)
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: BackendService, useValue: backendService },
        { provide: AppService, useValue: appService },
        { provide: Router, useValue: router },
        LanguageUrlSerializer,
        { provide: LanguageService, useValue: { codes: ['de', 'en'], prefix: '' } }
      ]
    });
  });

  it.each([
    ['/a/5/12/editor', '/a/5/12/editor'],
    ['/review/7/start', '/review/7/start'],
    ['/', ''],
    ['/en/a/5/12/editor', '/en/a/5/12/editor'],
    ['/en/', '']
  ])('should log out on %s and return to %j after the login', (url: string, back: string) => {
    router.routerState.snapshot.url = url;
    const directive = TestBed.runInInjectionContext(() => new LoginAgainDirective());

    directive.loginAgain();

    expect(backendService.logout).toHaveBeenCalled();
    expect(appService.clearErrorMessages).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/'], { queryParams: { redirectTo: back } });
  });

  it('should log out before it leaves, so that the start page comes up with its login', () => {
    const directive = TestBed.runInInjectionContext(() => new LoginAgainDirective());

    directive.loginAgain();

    expect(backendService.logout.mock.invocationCallOrder[0])
      .toBeLessThan(router.navigate.mock.invocationCallOrder[0]);
  });
});
