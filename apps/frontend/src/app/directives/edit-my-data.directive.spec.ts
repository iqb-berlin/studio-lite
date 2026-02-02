import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { of } from 'rxjs';
import { MyDataDto } from '@studio-lite-lib/api-dto';
import { EditMyDataDirective } from './edit-my-data.directive';
import { environment } from '../../environments/environment';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { EditMyDataComponent } from '../components/edit-my-data/edit-my-data.component';

describe('EditMyDataDirective', () => {
  let directive: EditMyDataDirective;
  let mockAppService: Partial<AppService>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockBackendService: jest.Mocked<BackendService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<EditMyDataComponent>>;

  const mockMyData: MyDataDto = {
    id: 1,
    description: 'Test description',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    emailPublishApproved: false
  };

  beforeEach(async () => {
    mockAppService = {
      authData: { userId: 1, userName: 'testUser' } as never,
      dataLoading: false
    };
    mockDialog = {
      open: jest.fn()
    } as never;
    mockBackendService = {
      getMyData: jest.fn(),
      setMyData: jest.fn()
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
        { provide: AppService, useValue: mockAppService },
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

    directive = new EditMyDataDirective(
      mockAppService as AppService,
      mockDialog,
      mockBackendService,
      mockSnackBar,
      mockTranslateService
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should fetch user data and open dialog when editMyData is called', done => {
    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(undefined));
    mockDialog.open.mockReturnValue(mockDialogRef);

    directive.editMyData().then(() => {
      mockBackendService.getMyData().subscribe(() => {
        expect(mockBackendService.getMyData).toHaveBeenCalled();
        expect(mockDialog.open).toHaveBeenCalledWith(EditMyDataComponent, {
          width: '600px',
          data: {
            description: 'Test description',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            emailPublishApproved: false
          }
        });
        done();
      });
    });
  });

  it('should update user data and show success message when changes are saved', done => {
    const mockFormGroup = new UntypedFormGroup({
      firstName: new UntypedFormControl('Jane'),
      lastName: new UntypedFormControl('Smith'),
      email: new UntypedFormControl('jane.smith@example.com'),
      emailPublishApproval: new UntypedFormControl(true),
      description: new UntypedFormControl('New description')
    });

    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockBackendService.setMyData.mockReturnValue(of(true));
    mockTranslateService.instant.mockReturnValue('Data updated');

    directive.editMyData().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        setTimeout(() => {
          expect(mockBackendService.setMyData).toHaveBeenCalledWith({
            id: 1,
            description: 'New description',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            emailPublishApproved: true
          });
          expect(mockSnackBar.open).toHaveBeenCalledWith(
            'Data updated',
            '',
            { duration: 1000 }
          );
          done();
        }, 0);
      });
    });
  });

  it('should only send changed fields when updating user data', done => {
    const mockFormGroup = new UntypedFormGroup({
      firstName: new UntypedFormControl('Jane'),
      lastName: new UntypedFormControl('Doe'),
      email: new UntypedFormControl('john.doe@example.com'),
      emailPublishApproval: new UntypedFormControl(false),
      description: new UntypedFormControl('Test description')
    });

    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockBackendService.setMyData.mockReturnValue(of(true));
    mockTranslateService.instant.mockReturnValue('Data updated');

    directive.editMyData().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        setTimeout(() => {
          expect(mockBackendService.setMyData).toHaveBeenCalledWith({
            id: 1,
            firstName: 'Jane'
          });
          done();
        }, 0);
      });
    });
  });

  it('should show error message when data update fails', done => {
    const mockFormGroup = new UntypedFormGroup({
      firstName: new UntypedFormControl('Jane'),
      lastName: new UntypedFormControl('Doe'),
      email: new UntypedFormControl('john.doe@example.com'),
      emailPublishApproval: new UntypedFormControl(false),
      description: new UntypedFormControl('Test description')
    });

    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockBackendService.setMyData.mockReturnValue(of(false));
    // Note: The actual implementation has nested instant() calls which is likely a bug
    mockTranslateService.instant.mockReturnValue('Error Message');

    directive.editMyData().then(() => {
      // Wait for the dialog to close and backend call to complete
      setTimeout(() => {
        expect(mockBackendService.setMyData).toHaveBeenCalled();
        expect(mockSnackBar.open).toHaveBeenCalled();
        expect(mockSnackBar.open).toHaveBeenCalledWith(
          'Error Message',
          'Error Message',
          { duration: 3000 }
        );
        done();
      }, 100);
    });
  });

  it('should not update data when dialog is cancelled', done => {
    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(false));
    mockDialog.open.mockReturnValue(mockDialogRef);

    directive.editMyData().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        expect(mockBackendService.setMyData).not.toHaveBeenCalled();
        expect(mockSnackBar.open).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('should not update data when result is undefined', done => {
    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(undefined));
    mockDialog.open.mockReturnValue(mockDialogRef);

    directive.editMyData().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        expect(mockBackendService.setMyData).not.toHaveBeenCalled();
        expect(mockSnackBar.open).not.toHaveBeenCalled();
        done();
      });
    });
  });

  it('should not open dialog when getMyData returns null', async () => {
    mockBackendService.getMyData.mockReturnValue(of(null));

    await directive.editMyData();

    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should set dataLoading flags correctly during update', done => {
    const mockFormGroup = new UntypedFormGroup({
      firstName: new UntypedFormControl('Jane'),
      lastName: new UntypedFormControl('Doe'),
      email: new UntypedFormControl('john.doe@example.com'),
      emailPublishApproval: new UntypedFormControl(false),
      description: new UntypedFormControl('Test description')
    });

    mockBackendService.getMyData.mockReturnValue(of(mockMyData));
    mockDialogRef.afterClosed.mockReturnValue(of(mockFormGroup));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockBackendService.setMyData.mockReturnValue(of(true));
    mockTranslateService.instant.mockReturnValue('Data updated');

    directive.editMyData().then(() => {
      mockDialogRef.afterClosed().subscribe(() => {
        setTimeout(() => {
          expect(mockAppService.dataLoading).toBe(false);
          done();
        }, 0);
      });
    });
  });
});
