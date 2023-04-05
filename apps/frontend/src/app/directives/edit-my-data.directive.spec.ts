import { inject, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditMyDataDirective } from './edit-my-data.directive';
import { environment } from '../../environments/environment';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';

describe('EditMyDataDirective', () => {
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
      (appService: AppService, dialog: MatDialog, backendService: BackendService, snackBar: MatSnackBar) => {
        const directive = new EditMyDataDirective(appService, dialog, backendService, snackBar);
        expect(directive).toBeTruthy();
      }));
});
