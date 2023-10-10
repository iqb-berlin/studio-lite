import { inject, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../environments/environment';
import { BackendService } from '../services/backend.service';
import { ChangePasswordDirective } from './change-password.directive';

describe('ChangePasswordDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientModule
      ],
      providers: [{
        provide: 'SERVER_URL',
        useValue: environment.backendUrl
      }]
    }).compileComponents();
  });

  it('should create an instance',
    inject([],
      (dialog: MatDialog, backendService: BackendService, snackBar: MatSnackBar, translateService:TranslateService) => {
        const directive = new ChangePasswordDirective(dialog, backendService, snackBar, translateService);
        expect(directive).toBeTruthy();
      }));
});
