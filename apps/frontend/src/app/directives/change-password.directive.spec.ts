import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackendService } from '../services/backend.service';
import { ChangePasswordDirective } from './change-password.directive';
import { ChangePasswordComponent } from '../components/change-password/change-password.component';

describe('ChangePasswordDirective', () => {
  let directive: ChangePasswordDirective;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockBackendService: jest.Mocked<BackendService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ChangePasswordComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      afterClosed: jest.fn()
    } as unknown as jest.Mocked<MatDialogRef<ChangePasswordComponent>>;

    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    } as unknown as jest.Mocked<MatDialog>;

    mockBackendService = {
      setUserPassword: jest.fn(),
      logout: jest.fn()
    } as unknown as jest.Mocked<BackendService>;

    mockSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    mockTranslateService = {
      instant: jest.fn()
    } as unknown as jest.Mocked<TranslateService>;

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true)
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: MatDialog, useValue: mockDialog },
        { provide: BackendService, useValue: mockBackendService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: Router, useValue: mockRouter },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    directive = new ChangePasswordDirective(
      mockDialog,
      mockBackendService,
      mockSnackBar,
      mockTranslateService,
      mockRouter
    );
  });

  it('should call backend service and show success message when password change succeeds', fakeAsync(() => {
    const mockFormGroup = new UntypedFormGroup({
      pw_old: new UntypedFormControl('oldPassword'),
      pw_new1: new UntypedFormControl('newPassword')
    });

    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockBackendService.setUserPassword.mockReturnValue(of(true));
    mockTranslateService.instant
      .mockReturnValueOnce('Password changed')
      .mockReturnValueOnce('OK');

    directive.changePassword();

    expect(mockBackendService.setUserPassword).toHaveBeenCalledWith('oldPassword', 'newPassword');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Password changed',
      'OK',
      { duration: 3000 }
    );
  }));

  // The server has ended every session of the account, this one included (#1901)
  it('should leave for the start page and log out when password change succeeds', fakeAsync(() => {
    const mockFormGroup = new UntypedFormGroup({
      pw_old: new UntypedFormControl('oldPassword'),
      pw_new1: new UntypedFormControl('newPassword')
    });
    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockBackendService.setUserPassword.mockReturnValue(of(true));

    directive.changePassword();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    expect(mockBackendService.logout).not.toHaveBeenCalled();
    flushMicrotasks();

    expect(mockBackendService.logout).toHaveBeenCalled();
  }));

  it('should not log out when the navigation away is cancelled', fakeAsync(() => {
    const mockFormGroup = new UntypedFormGroup({
      pw_old: new UntypedFormControl('oldPassword'),
      pw_new1: new UntypedFormControl('newPassword')
    });
    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockBackendService.setUserPassword.mockReturnValue(of(true));
    mockRouter.navigate.mockResolvedValue(false);

    directive.changePassword();
    flushMicrotasks();

    expect(mockBackendService.logout).not.toHaveBeenCalled();
  }));

  it('should show error message when password change fails', () => {
    const mockFormGroup = new UntypedFormGroup({
      pw_old: new UntypedFormControl('wrongPassword'),
      pw_new1: new UntypedFormControl('newPassword')
    });

    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockBackendService.setUserPassword.mockReturnValue(of(false));
    mockTranslateService.instant
      .mockReturnValueOnce('Password change failed')
      .mockReturnValueOnce('Error');

    directive.changePassword();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Password change failed',
      'Error',
      { duration: 3000 }
    );
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockBackendService.logout).not.toHaveBeenCalled();
  });

  // Esc, a click beside the dialog and navigation close it with undefined (#1844)
  it.each([false, undefined])('should not call backend service when the dialog closes with %s', result => {
    mockDialogRef.afterClosed.mockReturnValue(of(result));

    directive.changePassword();

    expect(mockBackendService.setUserPassword).not.toHaveBeenCalled();
    expect(mockSnackBar.open).not.toHaveBeenCalled();
  });
});
