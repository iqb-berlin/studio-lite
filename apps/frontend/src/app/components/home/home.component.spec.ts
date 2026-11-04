// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { AuthDataDto } from '@studio-lite-lib/api-dto';
import { HomeComponent } from './home.component';
import { AppService } from '../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { LoginComponent } from '../login/login.component';
import { AuthCheckFailedComponent } from '../auth-check-failed/auth-check-failed.component';
import { UserWorkspacesAreaComponent } from '../user-workspaces-area/user-workspaces-area.component';
import { UserReviewsAreaComponent } from '../user-reviews-area/user-reviews-area.component';
import { AppInfoComponent } from '../app-info/app-info.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let backendService: DeepMocked<BackendService>;

  @Component({ selector: 'studio-lite-app-info', standalone: true, template: '' })
  class MockAppInfoComponent {
    @Input() appTitle!: string;
    @Input() introHtml!: SafeUrl | undefined;
    @Input() appName!: string;
    @Input() appVersion!: string;
    @Input() userName!: string;
    @Input() userLongName!: string;
    @Input() isUserLoggedIn!: boolean;
    @Input() isAdmin!: boolean;
    @Input() hasReviews!: boolean;
  }

  @Component({ selector: 'studio-lite-login', standalone: true, template: '' })
  class MockLoginComponent {}

  @Component({ selector: 'studio-lite-auth-check-failed', standalone: true, template: '' })
  class MockAuthCheckFailedComponent {}

  @Component({ selector: 'studio-lite-user-workspaces-area', standalone: true, template: '' })
  class MockUserWorkspacesAreaComponent {}

  @Component({ selector: 'studio-lite-user-reviews-area', standalone: true, template: '' })
  class MockUserReviewsAreaComponent {}

  beforeEach(async () => {
    backendService = createMock<BackendService>({
      getConfig: jest.fn().mockReturnValue(of(null)),
      getAuthData: jest.fn().mockReturnValue(of(AppService.defaultAuthData))
    });
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: BackendService, useValue: backendService }
      ]
    }).overrideComponent(HomeComponent, {
      remove: {
        imports: [
          LoginComponent,
          AuthCheckFailedComponent,
          UserWorkspacesAreaComponent,
          AppInfoComponent,
          UserReviewsAreaComponent
        ]
      },
      add: {
        imports: [
          MockLoginComponent,
          MockAuthCheckFailedComponent,
          MockUserWorkspacesAreaComponent,
          MockAppInfoComponent,
          MockUserReviewsAreaComponent
        ]
      }
    }).compileComponents();
  });

  // Created outside the async setup, so that the timer of ngOnInit runs under fakeAsync.
  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
  });

  afterEach(() => localStorage.removeItem('id_token'));

  // Back on the start page, the workspaces and reviews are read again: they may have changed since the login.
  it('should reload the auth data of a stored login', fakeAsync(() => {
    const authData: AuthDataDto = { ...AppService.defaultAuthData, userId: 3, userName: 'anna' };
    backendService.getAuthData.mockReturnValue(of(authData));
    localStorage.setItem('id_token', 'token');

    fixture.detectChanges();
    tick();

    expect(TestBed.inject(AppService).authData).toBe(authData);
  }));

  it('should not ask for auth data without a stored login', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(backendService.getAuthData).not.toHaveBeenCalled();
  }));

  // A stored login the server could not check may still be valid (#2112).
  it('should offer a second attempt instead of the login form when the check of the login failed', fakeAsync(() => {
    TestBed.inject(AppService).setAuthCheckFailed(true);

    fixture.detectChanges();
    tick();

    expect(fixture.nativeElement.querySelector('studio-lite-auth-check-failed')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('studio-lite-login')).toBeNull();
  }));

  // Back on the start page mid-session while the server is down, the user is logged in already: the
  // hint would stand beside the workspaces. Only the check at start-up raises it.
  it('should leave the hint to the start when its own request for the auth data gets no answer', fakeAsync(() => {
    const appService = TestBed.inject(AppService);
    appService.authData = { ...AppService.defaultAuthData, userId: 3, userName: 'anna' };
    backendService.getAuthData.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    localStorage.setItem('id_token', 'token');

    fixture.detectChanges();
    tick();

    expect(appService.authCheckFailed()).toBe(false);
  }));
});
