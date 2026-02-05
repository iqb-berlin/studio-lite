/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { ExportReviewButtonComponent } from './export-review-button.component';
import { environment } from '../../../../../environments/environment';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';

class MockWorkspaceService {
  selectedWorkspaceId = 1;
}

class MockWorkspaceBackendService {
}

class MockAppService {
  dataLoading = false;
}

describe('ExportReviewButtonComponent', () => {
  let component: ExportReviewButtonComponent;
  let fixture: ComponentFixture<ExportReviewButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatDialogModule,
        MatIconModule
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: WorkspaceService, useClass: MockWorkspaceService },
        { provide: WorkspaceBackendService, useClass: MockWorkspaceBackendService },
        { provide: AppService, useClass: MockAppService }
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(ExportReviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
