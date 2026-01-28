import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { LogoutDirective } from './logout.directive';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { environment } from '../../environments/environment';

describe('LogoutDirective', () => {
  let directive: LogoutDirective;
  let mockAppService: Partial<AppService>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockBackendService: jest.Mocked<BackendService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialogRef: jest.Mocked<MatDialogRef<ConfirmDialogComponent>>;

  beforeEach(async () => {
    mockAppService = {
      authData: { userId: 1, userName: 'testUser' } as never
    };
    mockDialog = {
      open: jest.fn()
    } as never;
    mockBackendService = {
      logout: jest.fn()
    } as never;
    mockTranslateService = {
      instant: jest.fn()
    } as never;
    mockRouter = {
      navigate: jest.fn()
    } as never;
    mockDialogRef = {
      afterClosed: jest.fn()
    } as never;

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        { provide: AppService, useValue: mockAppService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: BackendService, useValue: mockBackendService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: Router, useValue: mockRouter },
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    directive = new LogoutDirective(
      mockAppService as AppService,
      mockDialog,
      mockBackendService,
      mockTranslateService,
      mockRouter
    );
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should open confirmation dialog when logout is called', () => {
    mockTranslateService.instant.mockReturnValue('Translated Text');
    mockDialogRef.afterClosed.mockReturnValue(of(false));
    mockDialog.open.mockReturnValue(mockDialogRef);

    directive.logout();

    expect(mockDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, {
      width: '400px',
      data: expect.objectContaining({
        title: 'Translated Text',
        content: 'Translated Text',
        confirmButtonLabel: 'Translated Text',
        showCancel: true
      })
    });
    expect(mockTranslateService.instant).toHaveBeenCalledWith('home.logout');
    expect(mockTranslateService.instant).toHaveBeenCalledWith('home.confirm-logout');
  });

  it('should logout when user confirms the dialog', done => {
    mockTranslateService.instant.mockReturnValue('Logout');
    mockDialogRef.afterClosed.mockReturnValue(of(true));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockRouter.navigate.mockReturnValue(Promise.resolve(true));

    directive.logout();

    mockDialogRef.afterClosed().subscribe(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      setTimeout(() => {
        expect(mockBackendService.logout).toHaveBeenCalled();
        done();
      }, 0);
    });
  });

  it('should not logout when user cancels the dialog', done => {
    mockTranslateService.instant.mockReturnValue('Logout');
    mockDialogRef.afterClosed.mockReturnValue(of(false));
    mockDialog.open.mockReturnValue(mockDialogRef);

    directive.logout();

    mockDialogRef.afterClosed().subscribe(() => {
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockBackendService.logout).not.toHaveBeenCalled();
      done();
    });
  });

  it('should not logout when navigation fails', done => {
    mockTranslateService.instant.mockReturnValue('Logout');
    mockDialogRef.afterClosed.mockReturnValue(of(true));
    mockDialog.open.mockReturnValue(mockDialogRef);
    mockRouter.navigate.mockReturnValue(Promise.resolve(false));

    directive.logout();

    mockDialogRef.afterClosed().subscribe(() => {
      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        expect(mockBackendService.logout).not.toHaveBeenCalled();
        done();
      }, 0);
    });
  });
});
