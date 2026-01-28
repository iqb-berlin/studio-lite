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
    mockDialog = {
      open: jest.fn()
    } as never;
    mockBackendService = {
      setUserPassword: jest.fn()
    } as never;
    mockSnackBar = {
      open: jest.fn()
    } as never;
    mockTranslateService = {
      instant: jest.fn()
    } as never;
    mockDialogRef = {
      afterClosed: jest.fn()
    } as never;

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

  it('should open change password dialog when changePassword is called', async () => {
    mockDialogRef.afterClosed.mockReturnValue(of(false));
    mockDialog.open.mockReturnValue(mockDialogRef);

    await directive.changePassword();

    expect(mockDialog.open).toHaveBeenCalledWith(ChangePasswordComponent, {
      width: '400px'
    });
  });

  it('should call backend service and show success message when password change succeeds', done => {
    const mockFormGroup = new UntypedFormGroup({
      pw_old: new UntypedFormControl('oldPassword'),
      pw_new1: new UntypedFormControl('newPassword')
    });

    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockBackendService.setUserPassword.mockReturnValue(of(true));
    mockTranslateService.instant.mockReturnValueOnce('Password changed')
      .mockReturnValueOnce('OK');

    directive.changePassword().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        expect(mockBackendService.setUserPassword).toHaveBeenCalledWith('oldPassword', 'newPassword');
        setTimeout(() => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Password changed',
            'OK',
            { duration: 3000 }
          );
          done();
        }, 0);
      });
    });
  });

  it('should show error message when password change fails', done => {
    const mockFormGroup = new UntypedFormGroup({
      pw_old: new UntypedFormControl('wrongPassword'),
      pw_new1: new UntypedFormControl('newPassword')
    });

    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockBackendService.setUserPassword.mockReturnValue(of(false));
    mockTranslateService.instant.mockReturnValueOnce('Password change failed')
      .mockReturnValueOnce('Error');

    directive.changePassword().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        setTimeout(() => {
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Password change failed',
            'Error',
            { duration: 3000 }
          );
          done();
        }, 0);
      });
    });
  });

  it('should not call backend service when dialog is cancelled', done => {
    mockDialogRef.afterClosed.mockReturnValue(of(false));
    mockDialog.open.mockReturnValue(mockDialogRef);

    directive.changePassword().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        expect(mockBackendService.setUserPassword).not.toHaveBeenCalled();
        expect(mockSnackBar.open).not.toHaveBeenCalled();
        done();
      });
    });
  });
});
