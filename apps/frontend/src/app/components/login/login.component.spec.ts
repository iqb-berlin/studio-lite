// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
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

  // The gateway in front (iqb-gate) refused the login, and its library has said why
  describe('a login the gateway refused', () => {
    let appService: AppService;
    let snackBar: MatSnackBar;

    beforeEach(() => {
      appService = TestBed.inject(AppService);
      snackBar = TestBed.inject(MatSnackBar);
      jest.spyOn(snackBar, 'open');
      backendService.login.mockReturnValue(throwError(() => new HttpErrorResponse({
        status: 428, error: { code: 'human-verification-required' }
      })));
      fillForm();
      component.login();
    });

    it('should not add a message of its own', () => {
      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('should end the attempt, so that the person can try again', () => {
      expect(component.isSubmitting).toBe(false);
      expect(appService.dataLoading).toBe(false);
      expect(appService.errorMessagesDisabled).toBe(false);
    });
  });

  // The person leaves the page while the login waits, as behind the gateway's challenge
  describe('a page left while the login waits for its answer', () => {
    let appService: AppService;
    let answer: Subject<boolean>;

    beforeEach(() => {
      appService = TestBed.inject(AppService);
      answer = new Subject<boolean>();
      backendService.login.mockReturnValue(answer);
      fillForm();
      component.login();
      fixture.destroy();
    });

    // Its answer holds tokens and a session on the server, kept or cleaned up only once it arrives (#1617)
    it('should let the login finish', () => {
      expect(answer.observed).toBe(true);
    });

    it('should switch off what the attempt switched on', () => {
      expect(appService.dataLoading).toBe(false);
      expect(appService.errorMessagesDisabled).toBe(false);
    });

    it('should not take the person away from the page open by then when the login succeeds', fakeAsync(() => {
      const router = TestBed.inject(Router);
      jest.spyOn(router, 'navigate');
      component.redirectTo = '/a/1';
      // The page the person went to loads something of its own
      appService.dataLoading = true;

      answer.next(true);
      flush();

      expect(router.navigate).not.toHaveBeenCalled();
      expect(appService.dataLoading).toBe(true);
    }));

    it('should say nothing on the page open by then when the login fails', fakeAsync(() => {
      const snackBar = TestBed.inject(MatSnackBar);
      jest.spyOn(snackBar, 'open');
      appService.errorMessagesDisabled = true;

      answer.next(false);
      flush();

      expect(snackBar.open).not.toHaveBeenCalled();
      expect(appService.errorMessagesDisabled).toBe(true);
    }));

    it('should leave the page open by then alone when the gateway refuses the login', () => {
      appService.dataLoading = true;

      answer.error(new HttpErrorResponse({ status: 428, error: { code: 'human-verification-required' } }));

      expect(appService.dataLoading).toBe(true);
    });
  });

  it('should leave what another page switched on when no login waits', () => {
    const appService = TestBed.inject(AppService);
    appService.dataLoading = true;

    fixture.destroy();

    expect(appService.dataLoading).toBe(true);
  });

  it('should say that a login did not succeed when it was answered with false', async () => {
    const snackBar = TestBed.inject(MatSnackBar);
    jest.spyOn(snackBar, 'open');
    backendService.login.mockReturnValue(of(false));
    fillForm();

    component.login();
    await fixture.whenStable();

    expect(snackBar.open).toHaveBeenCalledTimes(1);
  });
});
