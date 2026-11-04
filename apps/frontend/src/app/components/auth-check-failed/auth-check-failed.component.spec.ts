import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { createMock } from '@golevelup/ts-jest';
import { AuthCheckFailedComponent } from './auth-check-failed.component';
import { AppService } from '../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { AppHttpError } from '../../classes/app-http-error.class';
import { LogoutDirective } from '../../directives/logout.directive';

// The second attempt at checking a stored login the server did not answer for at start-up (#2112).
describe('AuthCheckFailedComponent', () => {
  let fixture: ComponentFixture<AuthCheckFailedComponent>;
  let restart: jest.SpyInstance;

  const setUp = (queryParams: Record<string, string>): void => {
    TestBed.configureTestingModule({
      imports: [AuthCheckFailedComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: BackendService, useValue: createMock<BackendService>() },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } }
      ]
    });
    fixture = TestBed.createComponent(AuthCheckFailedComponent);
    restart = jest
      .spyOn(fixture.componentInstance as unknown as { restart: (url: string | null) => void }, 'restart')
      .mockImplementation();
    fixture.detectChanges();
  };

  const clickRetry = (): void => {
    fixture.nativeElement.querySelector('[data-cy="auth-check-retry"]').click();
  };

  it('should start the studio again on the page the user was sent away from', () => {
    setUp({ redirectTo: '/a/5' });

    clickRetry();

    expect(restart).toHaveBeenCalledWith('#/a/5');
  });

  // A review link (#/home/<review>) keeps its name for the login form, should the login be refused.
  it('should start the studio again on the current page without a page to return to', () => {
    setUp({});

    clickRetry();

    expect(restart).toHaveBeenCalledWith(null);
  });

  // Whoever does not want to wait for this login reaches the login form through the logout.
  it('should offer the logout of the user menu', () => {
    setUp({});

    const logout = fixture.debugElement.query(By.css('[data-cy="auth-check-logout"]'));

    expect(logout.injector.get(LogoutDirective)).toBeTruthy();
  });

  // The general message that the server did not answer only covers the hint that says so in detail.
  it('should leave out messages without an answer from the server while the hint is shown', fakeAsync(() => {
    setUp({});
    const appService = TestBed.inject(AppService);
    appService.addErrorMessage(new AppHttpError(new HttpErrorResponse({ status: 500 })));
    tick();

    appService.addErrorMessage(new AppHttpError(new HttpErrorResponse({ status: 0 })));
    appService.addErrorMessage(new AppHttpError(new HttpErrorResponse({ status: 404 })));
    expect(appService.errorMessages.map(message => message.status)).toEqual([404]);

    fixture.destroy();
    appService.addErrorMessage(new AppHttpError(new HttpErrorResponse({ status: 502 })));
    expect(appService.errorMessages.map(message => message.status)).toEqual([404, 502]);
  }));
});
