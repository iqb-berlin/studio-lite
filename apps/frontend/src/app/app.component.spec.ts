// eslint-disable-next-line max-classes-per-file
import { Component } from '@angular/core';
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AppLogoDto } from '@studio-lite-lib/api-dto';
import { AppComponent } from './app.component';
import { AppService, standardLogo } from './services/app.service';
import { BackendService } from './services/backend.service';
import { HeartbeatService } from './services/heartbeat.service';
import { I18nService } from './services/i18n.service';
import { AppHttpError } from './classes/app-http-error.class';
import { UserMenuComponent } from './components/user-menu/user-menu.component';

@Component({ template: '', standalone: true })
class EmptyComponent {}

@Component({ selector: 'studio-lite-user-menu', template: '', standalone: true })
class MockUserMenuComponent {}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let backendService: DeepMocked<BackendService>;
  let appService: AppService;
  let router: Router;
  // The component writes the stored logo into the shared standardLogo; it is restored after each test.
  const standard = { ...standardLogo };

  beforeEach(async () => {
    backendService = createMock<BackendService>({
      getConfig: jest.fn().mockReturnValue(of(null)),
      getAppLogo: jest.fn().mockReturnValue(of(null)),
      getAuthData: jest.fn().mockReturnValue(of(AppService.defaultAuthData))
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: BackendService, useValue: backendService },
        {
          provide: HeartbeatService,
          useValue: createMock<HeartbeatService>({
            activityStatus$: of({ activePercentage: 100, passivePercentage: 100 })
          })
        },
        { provide: I18nService, useValue: createMock<I18nService>() }
      ]
    }).overrideComponent(AppComponent, {
      remove: { imports: [UserMenuComponent] },
      add: { imports: [MockUserMenuComponent] }
    }).compileComponents();
  });

  // Created outside the async setup, so that the timer of ngOnInit runs under fakeAsync.
  beforeEach(() => {
    appService = TestBed.inject(AppService);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
  });

  afterEach(() => {
    Object.assign(standardLogo, standard);
    localStorage.removeItem('id_token');
    document.documentElement.style.removeProperty('--st-body-background');
    document.documentElement.style.removeProperty('--st-box-background');
  });

  const cssVariable = (name: string): string => document.documentElement.style.getPropertyValue(name);

  // What the stored logo leaves empty keeps the standard, and both backgrounds reach the stylesheet.
  it.each<[string, AppLogoDto | null, AppLogoDto]>([
    [
      'the stored image and box background with the standard body background',
      { data: 'data:image/png;base64,AA', bodyBackground: '', boxBackground: '#123456' },
      { data: 'data:image/png;base64,AA', bodyBackground: standard.bodyBackground, boxBackground: '#123456' }
    ],
    [
      'the stored body background with the standard image and box background',
      { data: '', bodyBackground: '#654321', boxBackground: '' },
      { data: standard.data, bodyBackground: '#654321', boxBackground: standard.boxBackground }
    ],
    ['the standard logo when none is stored', null, standard]
  ])('should show %s', fakeAsync((_: string, storedLogo: AppLogoDto | null, shownLogo: AppLogoDto) => {
    backendService.getAppLogo.mockReturnValue(of(storedLogo));

    fixture.detectChanges();
    tick();

    expect(appService.appLogo).toEqual(shownLogo);
    expect(cssVariable('--st-body-background')).toBe(shownLogo.bodyBackground);
    expect(cssVariable('--st-box-background')).toBe(shownLogo.boxBackground);
  }));

  // The guards wait for the authentication to be complete; until then every guarded link would hang.
  it('should complete the authentication without asking for auth data when no token is stored', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(backendService.getAuthData).not.toHaveBeenCalled();
    expect(appService.authInitializationStatus$.value).toBe('complete');
    expect(appService.dataLoading).toBe(false);
  }));

  it('should complete the authentication and stop loading when the auth data cannot be loaded', fakeAsync(() => {
    localStorage.setItem('id_token', 'token');
    backendService.getAuthData.mockReturnValue(throwError(() => new Error('offline')));

    fixture.detectChanges();
    tick();

    expect(backendService.getAuthData).toHaveBeenCalled();
    expect(appService.authInitializationStatus$.value).toBe('complete');
    expect(appService.dataLoading).toBe(false);
  }));

  // The print view is opened with query parameters, so the area is read up to the first "/" or "?".
  it.each([
    ['/print?unitIds=1&workspaceId=2', false],
    ['/review/3', false],
    ['/a/5/12/editor', true]
  ])('should link the imprint and the administration on %s: %s', fakeAsync((url: string, shown: boolean) => {
    appService.authData = { ...AppService.defaultAuthData, userId: 1, isAdmin: true };
    fixture.detectChanges();
    tick();

    router.navigateByUrl(url);
    tick();
    fixture.detectChanges();

    const header: HTMLElement = fixture.nativeElement.querySelector('header');
    expect(!!header.querySelector('[data-cy="app-info"]')).toBe(shown);
    expect(!!header.querySelector('[data-cy="goto-admin"]')).toBe(shown);
  }));

  it.each([
    ['/a/5/12/editor', '/a/5/12/editor'],
    ['/', '']
  ])('should log out from an error on %s and return to %j after the login', fakeAsync((url: string, back: string) => {
    fixture.detectChanges();
    tick();
    router.navigateByUrl(url);
    tick();
    appService.addErrorMessage(new AppHttpError(new HttpErrorResponse({ status: 401 })));
    fixture.detectChanges();
    const navigate = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture.nativeElement.querySelector('.error-container button[mat-raised-button]').click();

    expect(backendService.logout).toHaveBeenCalled();
    expect(appService.errorMessages).toEqual([]);
    expect(navigate).toHaveBeenCalledWith(['/'], { queryParams: { redirectTo: back } });
  }));
});
