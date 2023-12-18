import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { inject, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { LogoutDirective } from './logout.directive';
import { AppService } from '../services/app.service';
import { BackendService } from '../services/backend.service';
import { environment } from '../../environments/environment';

describe('LogoutDirective', () => {
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
      (appService: AppService,
       dialog: MatDialog,
       backendService: BackendService,
       translateService: TranslateService) => {
        const directive = new LogoutDirective(
          appService, dialog, backendService, translateService
        );
        expect(directive).toBeTruthy();
      }));
});
