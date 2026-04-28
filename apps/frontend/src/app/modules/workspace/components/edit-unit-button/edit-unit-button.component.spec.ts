/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import {
  EditWorkspaceSettingsComponent
} from '../../../../components/edit-workspace-settings/edit-workspace-settings.component';
import { environment } from '../../../../../environments/environment';
import { EditUnitButtonComponent } from './edit-unit-button.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { MetadataService } from '../../../metadata/services/metadata.service';

describe('EditUnitButtonComponent', () => {
  let component: EditUnitButtonComponent;
  let fixture: ComponentFixture<EditUnitButtonComponent>;
  let mockWorkspaceService: DeepMocked<WorkspaceService>;
  let mockWorkspaceBackendService: DeepMocked<WorkspaceBackendService>;
  let mockAppService: DeepMocked<AppService>;
  let mockAppBackendService: DeepMocked<AppBackendService>;
  let mockMetadataService: DeepMocked<MetadataService>;
  let mockDialog: DeepMocked<MatDialog>;
  let mockRouter: DeepMocked<Router>;
  let mockActivatedRoute: DeepMocked<ActivatedRoute>;

  beforeEach(async () => {
    mockWorkspaceService = createMock<WorkspaceService>({
      selectedWorkspaceName: 'Test Workspace',
      selectedWorkspaceId: 1,
      workspaceSettings: {
        unitMDProfile: 'profile',
        itemMDProfile: 'profile',
        defaultEditor: 'editor',
        defaultPlayer: 'player',
        defaultSchemer: 'schemer',
        unitGroups: []
      } as WorkspaceSettingsDto,
      selectedUnit$: new BehaviorSubject<number>(0),
      unitList: {}
    });
    mockWorkspaceBackendService = createMock<WorkspaceBackendService>();
    mockAppService = createMock<AppService>({
      dataLoading: false
    });
    mockAppBackendService = createMock<AppBackendService>({
      setWorkspaceSettings: jest.fn().mockReturnValue(of(true))
    });
    mockMetadataService = createMock<MetadataService>();
    mockDialog = createMock<MatDialog>();
    mockRouter = createMock<Router>();
    mockActivatedRoute = createMock<ActivatedRoute>({
      root: createMock<ActivatedRoute>()
    });

    await TestBed.configureTestingModule({
      imports: [
        MatTooltipModule,
        MatSnackBarModule,
        MatDialogModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        TranslateModule.forRoot(),
        EditUnitButtonComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: WorkspaceBackendService, useValue: mockWorkspaceBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: AppBackendService, useValue: mockAppBackendService },
        { provide: MetadataService, useValue: mockMetadataService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditUnitButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set userListTitle on init', () => {
    expect(component.userListTitle).toBe('workspace.user-list');
  });

  it('should update workspace settings and call backend when settings dialog is closed with result', async () => {
    const mockSettings: WorkspaceSettingsDto = {
      defaultEditor: 'new-editor',
      defaultPlayer: 'new-player',
      defaultSchemer: 'new-schemer',
      stableModulesOnly: false,
      unitMDProfile: 'new-profile',
      itemMDProfile: 'new-profile',
      states: [],
      hiddenRoutes: ['editor'],
      richNoteTags: [],
      unitGroups: []
    };

    mockDialog.open.mockReturnValue(createMock<MatDialogRef<EditWorkspaceSettingsComponent>>({
      afterClosed: () => of(mockSettings)
    }));

    await component.settings();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['a/1'],
      { relativeTo: mockActivatedRoute.root }
    );
    expect(mockWorkspaceService.workspaceSettings).toEqual(expect.objectContaining(mockSettings));
    expect(mockAppBackendService.setWorkspaceSettings).toHaveBeenCalledWith(
      mockWorkspaceService.selectedWorkspaceId,
      mockWorkspaceService.workspaceSettings
    );
  });
});
