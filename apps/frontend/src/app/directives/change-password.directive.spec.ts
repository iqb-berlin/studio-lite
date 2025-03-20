import { inject, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BackendService } from '../services/backend.service';
import { ChangePasswordDirective } from './change-password.directive';
import { AuthService } from '../modules/auth/service/auth.service';
import { AppService } from '../services/app.service';

describe('ChangePasswordDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();
  });

  it('should create an instance',
    inject([],
      (dialog: MatDialog,
       backendService: BackendService,
       snackBar: MatSnackBar,
       translateService: TranslateService,
       authService: AuthService,
       appService: AppService) => {
        const directive =
          new ChangePasswordDirective(dialog, backendService, snackBar, translateService, appService, authService);
        expect(directive).toBeTruthy();
      }));
});
