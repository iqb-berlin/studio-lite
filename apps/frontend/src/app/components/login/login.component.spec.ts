// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginComponent } from './login.component';
import { BackendService } from '../../services/backend.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let backendService: { login: jest.Mock };

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
        { provide: BackendService, useValue: backendService }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
