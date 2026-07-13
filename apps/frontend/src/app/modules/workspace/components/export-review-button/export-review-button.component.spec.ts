/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { ExportReviewButtonComponent } from './export-review-button.component';
import { environment } from '../../../../../environments/environment';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { ExportUnitComponent } from '../export-unit/export-unit.component';

describe('ExportReviewButtonComponent', () => {
  let component: ExportReviewButtonComponent;
  let fixture: ComponentFixture<ExportReviewButtonComponent>;
  let mockWorkspaceService: DeepMocked<WorkspaceService>;
  let mockWorkspaceBackendService: DeepMocked<WorkspaceBackendService>;
  let mockAppService: DeepMocked<AppService>;
  let mockDialog: DeepMocked<MatDialog>;

  beforeEach(async () => {
    mockWorkspaceService = createMock<WorkspaceService>({ selectedWorkspaceId: 1 });
    mockWorkspaceBackendService = createMock<WorkspaceBackendService>();
    mockAppService = createMock<AppService>({ dataLoading: false });
    mockDialog = createMock<MatDialog>();

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatDialogModule,
        MatIconModule,
        ExportReviewButtonComponent
      ],
      providers: [
        provideHttpClient(),
        { provide: 'SERVER_URL', useValue: environment.backendUrl },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: WorkspaceBackendService, useValue: mockWorkspaceBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExportReviewButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('exportReview', () => {
    const buildSettings = (format: 'json' | 'xml'): UnitDownloadSettingsDto => ({
      unitIdList: [1],
      exportFormat: format,
      addPlayers: false,
      addComments: false,
      addRichNotes: false,
      addTestTakersReview: 0,
      addTestTakersMonitor: 0,
      addTestTakersHot: 0,
      passwordLess: false,
      bookletSettings: []
    });

    beforeEach(() => {
      mockWorkspaceBackendService.downloadUnitsJson.mockReturnValue(of(null));
      mockWorkspaceBackendService.downloadUnits.mockReturnValue(of(null));
    });

    it('should call downloadUnitsJson when exportFormat is json', () => {
      const settings = buildSettings('json');
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ExportUnitComponent>>({
        afterClosed: () => of(settings)
      }));

      component.exportReview();

      expect(mockWorkspaceBackendService.downloadUnitsJson).toHaveBeenCalledWith(
        mockWorkspaceService.selectedWorkspaceId, settings
      );
      expect(mockWorkspaceBackendService.downloadUnits).not.toHaveBeenCalled();
    });

    it('should call downloadUnits when exportFormat is xml', () => {
      const settings = buildSettings('xml');
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ExportUnitComponent>>({
        afterClosed: () => of(settings)
      }));

      component.exportReview();

      expect(mockWorkspaceBackendService.downloadUnits).toHaveBeenCalledWith(
        mockWorkspaceService.selectedWorkspaceId, settings
      );
      expect(mockWorkspaceBackendService.downloadUnitsJson).not.toHaveBeenCalled();
    });

    it('should not call any download when dialog is cancelled', () => {
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ExportUnitComponent>>({
        afterClosed: () => of(false)
      }));

      component.exportReview();

      expect(mockWorkspaceBackendService.downloadUnitsJson).not.toHaveBeenCalled();
      expect(mockWorkspaceBackendService.downloadUnits).not.toHaveBeenCalled();
    });
  });
});
