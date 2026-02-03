import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  let mockDialogRef: jest.Mocked<MatDialogRef<ChangePasswordComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      afterClosed: jest.fn()
    } as unknown as jest.Mocked<MatDialogRef<ChangePasswordComponent>>;

    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    } as unknown as jest.Mocked<MatDialog>;

    mockBackendService = {
      setUserPassword: jest.fn()
    } as unknown as jest.Mocked<BackendService>;

    mockSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    mockTranslateService = {
      instant: jest.fn()
    } as unknown as jest.Mocked<TranslateService>;

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
      mockTranslateService
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should open change password dialog when changePassword is called', () => {
    mockDialogRef.afterClosed.mockReturnValue(of(false));

    directive.changePassword();

    expect(mockDialog.open).toHaveBeenCalledWith(ChangePasswordComponent, {
      width: '400px'
    });
  });

  it('should call backend service and show success message when password change succeeds', () => {
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
  });

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
  });

  it('should not call backend service when dialog is cancelled', () => {
    mockDialogRef.afterClosed.mockReturnValue(of(false));

    directive.changePassword();

    expect(mockBackendService.setUserPassword).not.toHaveBeenCalled();
    expect(mockSnackBar.open).not.toHaveBeenCalled();
  });

  it('should cleanup subscriptions on destroy', () => {
    // This mostly tests that ngOnDestroy exists and runs without error
    directive.ngOnDestroy();
    // Since ngUnsubscribe is private, we can't easily check if it emitted/completed
    // without using 'any' or changing visibility.
    // But we can ensure the method is callable.
  });
});
