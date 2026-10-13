// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  ActivatedRoute, Params, provideRouter, Router
} from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import {
  BehaviorSubject, of, Subject, throwError
} from 'rxjs';
import { createMock } from '@golevelup/ts-jest';
import { environment } from '../../../environments/environment';
import { LoginComponent } from './login.component';
import { BackendService } from '../../services/backend.service';
import { AppService, defaultAppConfig } from '../../services/app.service';
import { AppConfig } from '../../classes/app-config.class';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let backendService: { login: jest.Mock };
  let params: BehaviorSubject<Params>;
  let queryParams: BehaviorSubject<Params>;

  @Component({ selector: 'studio-lite-warning', template: '', standalone: true })
  class MockWarningComponent {
    @Input() warnMessage!: string;
  }

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: true })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  const fillForm = (): void => {
    component.loginForm.setValue({ name: 'user', pw: 'pw' });
  };

  const submitButton = (): HTMLButtonElement => fixture.nativeElement
    .querySelector('[data-cy="home-submit-button"]');

  beforeEach(async () => {
    backendService = { login: jest.fn().mockReturnValue(of(true)) };
    params = new BehaviorSubject<Params>({});
    queryParams = new BehaviorSubject<Params>({});
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot(),
        MockWarningComponent,
        MockAreaTitleComponent
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: BackendService, useValue: backendService },
        { provide: ActivatedRoute, useValue: createMock<ActivatedRoute>({ params, queryParams }) }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Every login without a sessionId creates its own session row, and the frontend keeps the
  // tokens of the last response only -- so a second call leaves behind a session nobody can
  // reach or log out for a whole inactivity window (#1617).
  describe('protection against a second submit', () => {
    it('should send only one login while the first is still in flight', () => {
      backendService.login.mockReturnValue(new Subject<boolean>());
      fillForm();

      component.login();
      component.login();

      expect(backendService.login).toHaveBeenCalledTimes(1);
    });

    it('should disable the submit button while a login is in flight', () => {
      backendService.login.mockReturnValue(new Subject<boolean>());
      fillForm();
      fixture.detectChanges();
      expect(submitButton().disabled).toBe(false);

      component.login();
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(true);
    });

    // A wrong password has to be answerable with a second attempt.
    it('should accept a new attempt once the answer arrived', async () => {
      const answer = new Subject<boolean>();
      backendService.login.mockReturnValue(answer);
      fillForm();

      component.login();
      answer.next(false);
      await component.validLoginCheck(false, false);
      component.login();

      expect(backendService.login).toHaveBeenCalledTimes(2);
    });

    it('should keep the button disabled while the form is incomplete', () => {
      fixture.detectChanges();

      expect(submitButton().disabled).toBe(true);
    });
  });

  // The login holds error messages back so that a failed attempt is reported once, by the snack
  // bar. Nothing reloads the page afterwards, so unless the answer switches them on again, every
  // 403, 404 or 500 after a login stays silent (#1724).
  describe('error messages around a login', () => {
    let appService: AppService;

    beforeEach(() => {
      appService = TestBed.inject(AppService);
    });

    it('should hold error messages back while the answer is outstanding', () => {
      backendService.login.mockReturnValue(new Subject<boolean>());
      fillForm();

      component.login();

      expect(appService.errorMessagesDisabled).toBe(true);
    });

    it('should show error messages again after a successful login', async () => {
      const answer = new Subject<boolean>();
      backendService.login.mockReturnValue(answer);
      fillForm();

      component.login();
      answer.next(true);
      await fixture.whenStable();

      expect(appService.errorMessagesDisabled).toBe(false);
    });

    it('should show error messages again after a failed login', async () => {
      const answer = new Subject<boolean>();
      backendService.login.mockReturnValue(answer);
      fillForm();

      component.login();
      answer.next(false);
      await fixture.whenStable();

      expect(appService.errorMessagesDisabled).toBe(false);
    });
  });

  // A review link carries its login name in the route, so only the password is asked for.
  it('should preset the login name of a review link', () => {
    params.next({ login: 'review-17' });
    fixture.detectChanges();

    expect(component.loginForm.value).toEqual({ name: 'review-17', pw: '' });
    expect(fixture.nativeElement.textContent).toContain('home.login-with-preset');
  });

  describe('the page after a login', () => {
    let appService: AppService;
    let navigate: jest.SpyInstance;

    beforeEach(() => {
      appService = TestBed.inject(AppService);
      navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    });

    it.each([
      ['the page the user was sent away from', '/a/5/12/editor', true, ['/a/5/12/editor']],
      ['the administration after the first login of an installation', undefined, false, ['/admin']]
    ])('should open %s', async (_: string, redirectTo: string | undefined, hasUsers: boolean, page: string[]) => {
      queryParams.next({ redirectTo });
      appService.appConfig = new AppConfig(TestBed.inject(Title), { ...defaultAppConfig, hasUsers });
      fillForm();

      component.login();
      await fixture.whenStable();

      expect(backendService.login).toHaveBeenCalledWith('user', 'pw', !hasUsers);
      expect(navigate).toHaveBeenCalledWith(page);
    });

    // The start page shows the workspaces and reviews of whoever has logged in on it.
    it('should stay on the start page after an ordinary login', async () => {
      fillForm();

      component.login();
      await fixture.whenStable();

      expect(navigate).not.toHaveBeenCalled();
    });
  });

  // The gateway in front (iqb-gate) checks the login too: what it rejects is no wrong password
  describe('a login the gateway did not let through', () => {
    let snackBar: MatSnackBar;

    beforeEach(() => {
      snackBar = TestBed.inject(MatSnackBar);
      jest.spyOn(snackBar, 'open');
    });

    const loginAnsweredWith = async (error: HttpErrorResponse): Promise<void> => {
      backendService.login.mockReturnValue(throwError(() => error));
      fillForm();
      component.login();
      await fixture.whenStable();
    };

    it('should say that the browser was rejected as automated', async () => {
      await loginAnsweredWith(new HttpErrorResponse({ status: 403, error: { code: 'automation-detected' } }));

      expect(snackBar.open).toHaveBeenCalledWith('login.automation-detected', 'login.error', { duration: 3000 });
    });

    it('should say that the person was not confirmed', async () => {
      await loginAnsweredWith(new HttpErrorResponse({ status: 428 }));

      expect(snackBar.open).toHaveBeenCalledWith('login.not-verified', 'login.error', { duration: 3000 });
    });

    it('should accept a new attempt and show error messages again', async () => {
      await loginAnsweredWith(new HttpErrorResponse({ status: 428 }));

      expect(TestBed.inject(AppService).errorMessagesDisabled).toBe(false);
      component.login();
      expect(backendService.login).toHaveBeenCalledTimes(2);
    });
  });

  describe('leaving the page', () => {
    let appService: AppService;

    beforeEach(() => {
      appService = TestBed.inject(AppService);
    });

    it('should cancel a login still in flight and switch off what it switched on', () => {
      const answer = new Subject<boolean>();
      backendService.login.mockReturnValue(answer);
      fillForm();
      component.login();

      fixture.destroy();

      expect(answer.observed).toBe(false);
      expect(component.isSubmitting).toBe(false);
      expect(appService.dataLoading).toBe(false);
      expect(appService.errorMessagesDisabled).toBe(false);
    });

    it('should leave the loading state alone when no login is running', () => {
      appService.dataLoading = true;

      fixture.destroy();

      expect(appService.dataLoading).toBe(true);
    });

    it('should stop following the route', () => {
      expect(queryParams.observed).toBe(true);
      expect(params.observed).toBe(true);

      fixture.destroy();

      expect(queryParams.observed).toBe(false);
      expect(params.observed).toBe(false);
    });
  });

  it('should report a wrong password as before', async () => {
    const snackBar = TestBed.inject(MatSnackBar);
    jest.spyOn(snackBar, 'open');

    await component.validLoginCheck(false, false);

    expect(snackBar.open).toHaveBeenCalledWith('login.no-success', 'login.error', { duration: 3000 });
  });
});
