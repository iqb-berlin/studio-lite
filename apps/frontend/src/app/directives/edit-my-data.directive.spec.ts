import { inject, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EditMyDataDirective } from './edit-my-data.directive';
import { environment } from '../../environments/environment';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { AuthService } from '../modules/auth/service/auth.service';

describe('EditMyDataDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();
  });

  it('should create an instance',
    inject([], (
      appService: AppService,
      dialog: MatDialog,
      backendService: BackendService,
      snackBar: MatSnackBar,
      translateService: TranslateService,
      authService: AuthService) => {
      const directive =
        new EditMyDataDirective(appService, dialog, backendService, snackBar, translateService, authService);
      expect(directive).toBeTruthy();
    }));
});
