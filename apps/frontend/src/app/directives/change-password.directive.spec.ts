import { inject, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
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
      (dialog: MatDialog, backendService: BackendService, snackBar: MatSnackBar) => {
        const directive = new ChangePasswordDirective(dialog, backendService, snackBar);
        expect(directive).toBeTruthy();
      }));
});
