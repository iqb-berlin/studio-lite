import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
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
import {
  RequestReportDto, UnitDownloadSettingsDto, UnitPropertiesDto, UsersInWorkspaceDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { MessageDialogComponent } from '@studio-lite-lib/iqb-components';
import {
  EditWorkspaceSettingsComponent
} from '../../../../components/edit-workspace-settings/edit-workspace-settings.component';
import { ExportUnitComponent } from '../export-unit/export-unit.component';
import { environment } from '../../../../../environments/environment';
import { EditUnitButtonComponent } from './edit-unit-button.component';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { MetadataService } from '../../../metadata/services/metadata.service';
import { MoveUnitComponent } from '../move-unit/move-unit.component';
import { RequestMessageComponent } from '../../../../components/request-message/request-message.component';
import { SelectUnitComponent } from '../select-unit/select-unit.component';
import { ShowMetadataComponent } from '../show-metadata/show-metadata.component';
import { TableViewComponent } from '../../../metadata/components/table-view/table-view.component';
import { WorkspaceUserListComponent } from '../workspace-user-list/workspace-user-list.component';
import { GroupManageComponent } from '../group-manage/group-manage.component';
import { PrintUnitsDialogComponent } from '../print-units-dialog/print-units-dialog.component';

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

  // Some dialog results reach the backend calls through native async/await, which fakeAsync cannot
  // flush (the specs compile to es2020); a macrotask runs only after every pending promise callback.
  const settle = (): Promise<void> => new Promise(resolve => { setTimeout(resolve); });

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

  it('should set userListTitle on init', () => {
    expect(component.userListTitle).toBe('workspace.user-list');
  });

  describe('exportUnit', () => {
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
      mockWorkspaceService.unitList = { 1: {} } as unknown as typeof mockWorkspaceService.unitList;
      mockWorkspaceBackendService.downloadUnitsJson.mockReturnValue(of(null));
      mockWorkspaceBackendService.downloadUnits.mockReturnValue(of(null));
    });

    it('should call downloadUnitsJson when exportFormat is json', () => {
      const settings = buildSettings('json');
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ExportUnitComponent>>({
        afterClosed: () => of(settings)
      }));

      component.exportUnit();

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

      component.exportUnit();

      expect(mockWorkspaceBackendService.downloadUnits).toHaveBeenCalledWith(
        mockWorkspaceService.selectedWorkspaceId, settings
      );
      expect(mockWorkspaceBackendService.downloadUnitsJson).not.toHaveBeenCalled();
    });
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

  describe('settings', () => {
    const closeSettingsWith = (result: WorkspaceSettingsDto | undefined): void => {
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<EditWorkspaceSettingsComponent>>({
        afterClosed: () => of(result)
      }));
    };
    const changedEditor = (): WorkspaceSettingsDto => ({
      ...mockWorkspaceService.workspaceSettings, defaultEditor: 'new-editor'
    });

    it('should save nothing when the settings dialog is dismissed', async () => {
      closeSettingsWith(undefined);

      await component.settings();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockAppBackendService.setWorkspaceSettings).not.toHaveBeenCalled();
    });

    it('should keep the unit open when the metadata profiles stay the same', async () => {
      closeSettingsWith(changedEditor());

      await component.settings();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockAppBackendService.setWorkspaceSettings).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ defaultEditor: 'new-editor' })
      );
    });

    it('should save no new metadata profile when the open unit cannot be left', async () => {
      mockRouter.navigate.mockResolvedValue(false);
      closeSettingsWith({ ...mockWorkspaceService.workspaceSettings, itemMDProfile: 'other-profile' });

      await component.settings();

      expect(mockAppBackendService.setWorkspaceSettings).not.toHaveBeenCalled();
      expect(mockWorkspaceService.workspaceSettings.itemMDProfile).toBe('profile');
    });

    it('should say when the backend refuses the settings', async () => {
      mockAppBackendService.setWorkspaceSettings.mockReturnValue(of(false));
      const snackBarOpen = jest.spyOn(component.snackBar, 'open');
      closeSettingsWith(changedEditor());

      await component.settings();

      expect(snackBarOpen).toHaveBeenCalledWith('workspace.settings-not-saved', 'workspace.error', { duration: 3000 });
    });
  });

  describe('moveOrCopyUnit', () => {
    const closeMoveDialogWith = (result: boolean | undefined, targetWorkspace: number): void => {
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<MoveUnitComponent>>({
        afterClosed: () => of(result),
        componentInstance: createMock<MoveUnitComponent>({
          targetWorkspace, selectedUnits: [3, 4], copyComments: false
        })
      }));
    };

    beforeEach(() => {
      mockRouter.navigate.mockResolvedValue(true);
      mockWorkspaceBackendService.moveUnits.mockReturnValue(of(false));
      mockWorkspaceBackendService.copyUnits.mockReturnValue(of(false));
    });

    it('should move the selected units after leaving the open unit and warn of the lost drop box history',
      async () => {
        closeMoveDialogWith(true, 2);

        component.moveOrCopyUnit(true);
        await settle();

        expect(mockDialog.open).toHaveBeenCalledWith(MoveUnitComponent, expect.objectContaining({
          data: expect.objectContaining({
            title: 'workspace.move-units',
            subtitle: 'workspace.unit-dropbox-history-deleted',
            commentsOption: false,
            buttonLabel: 'workspace.move'
          })
        }));
        expect(mockRouter.navigate).toHaveBeenCalledWith(['a/1'], { relativeTo: mockActivatedRoute.root });
        expect(mockWorkspaceBackendService.moveUnits).toHaveBeenCalledWith(1, [3, 4], 2);
        expect(mockWorkspaceBackendService.copyUnits).not.toHaveBeenCalled();
      });

    it('should copy the selected units with the chosen comment option and keep the unit open', async () => {
      closeMoveDialogWith(true, 2);

      component.moveOrCopyUnit(false);
      await settle();

      expect(mockDialog.open).toHaveBeenCalledWith(MoveUnitComponent, expect.objectContaining({
        data: expect.objectContaining({
          title: 'workspace.copy-units', subtitle: '', commentsOption: true, buttonLabel: 'workspace.copy'
        })
      }));
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockWorkspaceBackendService.copyUnits).toHaveBeenCalledWith(2, [3, 4], false);
      expect(mockWorkspaceBackendService.moveUnits).not.toHaveBeenCalled();
    });

    it.each<[string, boolean | undefined, number]>([
      ['is dismissed', undefined, 2],
      ['is cancelled', false, 2],
      ['names no target workspace', true, 0]
    ])('should move nothing when the dialog %s', async (_, result, target) => {
      closeMoveDialogWith(result, target);

      component.moveOrCopyUnit(true);
      await settle();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockWorkspaceBackendService.moveUnits).not.toHaveBeenCalled();
    });
  });

  describe('moveOrCopyUnitSubscription', () => {
    let snackBarOpen: jest.SpyInstance;
    let translate: jest.SpyInstance;

    beforeEach(() => {
      snackBarOpen = jest.spyOn(component.snackBar, 'open');
      translate = jest.spyOn(component.translateService, 'instant');
    });

    it.each([[true, 'verschieben'], [false, 'kopieren']])(
      'should say that the units could not be moved (%s) or copied: %s',
      (moveOnly, action) => {
        component.moveOrCopyUnitSubscription(false, moveOnly);

        expect(translate).toHaveBeenCalledWith('workspace.unit-not-moved-or-copied', { action });
        expect(snackBarOpen)
          .toHaveBeenCalledWith('workspace.unit-not-moved-or-copied', 'workspace.error', { duration: 3000 });
        expect(mockWorkspaceBackendService.getUnitGroups).not.toHaveBeenCalled();
      });

    it.each([[true, 'verschoben'], [false, 'kopiert']])(
      'should confirm that the units were moved (%s) or copied: %s and reload the unit list',
      (moveOnly, action) => {
        component.moveOrCopyUnitSubscription({ source: 'unit-patch', messages: [] }, moveOnly);

        expect(translate).toHaveBeenCalledWith('workspace.unit-moved-or-copied', { action });
        expect(snackBarOpen).toHaveBeenCalledWith('workspace.unit-moved-or-copied', '', { duration: 5000 });
        expect(mockWorkspaceBackendService.getUnitGroups).toHaveBeenCalledWith(1);
      });

    it('should show the report of units that could not be moved and reload the unit list after it', () => {
      const report: RequestReportDto = {
        source: 'unit-patch', messages: [{ objectKey: 'U1', messageKey: 'unit-patch.target-has-unit-key' }]
      };
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<RequestMessageComponent>>({
        afterClosed: () => of(undefined)
      }));

      component.moveOrCopyUnitSubscription(report, true);

      expect(mockDialog.open).toHaveBeenCalledWith(RequestMessageComponent, expect.objectContaining({ data: report }));
      expect(snackBarOpen).not.toHaveBeenCalled();
      expect(mockWorkspaceBackendService.getUnitGroups).toHaveBeenCalledWith(1);
    });
  });

  describe('submitUnits and returnSubmittedUnits', () => {
    const closeSelectDialogWith = (result: boolean | undefined, selectedUnitIds: number[]): void => {
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<SelectUnitComponent>>({
        afterClosed: () => of(result),
        componentInstance: createMock<SelectUnitComponent>({ selectedUnitIds })
      }));
    };

    beforeEach(() => {
      mockRouter.navigate.mockResolvedValue(true);
      mockWorkspaceBackendService.submitUnits.mockReturnValue(of(false));
      mockWorkspaceBackendService.returnSubmittedUnits.mockReturnValue(of(false));
    });

    it('should submit the selected units to the drop box after leaving the open unit', async () => {
      mockWorkspaceService.dropBoxId = 7;
      closeSelectDialogWith(true, [3, 4]);

      component.submitUnits();
      await settle();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['a/1'], { relativeTo: mockActivatedRoute.root });
      expect(mockWorkspaceBackendService.submitUnits).toHaveBeenCalledWith(1, 7, [3, 4]);
    });

    it('should offer only the units submitted to this workspace for return', async () => {
      mockWorkspaceService.hasDroppedUnits = true;
      closeSelectDialogWith(true, [3, 4]);

      component.returnSubmittedUnits();
      await settle();

      const data = mockDialog.open.mock.calls[0][1]?.data as { queryParams: { toString(): string } };
      expect(data.queryParams.toString()).toBe('targetWorkspaceId=1&filterTargetWorkspaceId=true');
      expect(mockWorkspaceBackendService.returnSubmittedUnits).toHaveBeenCalledWith(1, [3, 4]);
    });

    it.each<[string, boolean | undefined, number[]]>([
      ['is dismissed', undefined, [3]],
      ['is cancelled', false, [3]],
      ['has no unit selected', true, []]
    ])('should submit nothing when the dialog %s', async (_, result, ids) => {
      mockWorkspaceService.dropBoxId = 7;
      closeSelectDialogWith(result, ids);

      component.submitUnits();
      await settle();

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockWorkspaceBackendService.submitUnits).not.toHaveBeenCalled();
    });
  });

  describe('dialogs that need units', () => {
    it.each<[string, (button: EditUnitButtonComponent) => void]>([
      ['printUnits', button => button.printUnits()],
      ['showMetadata', button => button.showMetadata()],
      ['exportCodingBook', button => button.exportCodingBook()],
      ['showCodingReport', button => button.showCodingReport()]
    ])('should open nothing from %s when the workspace has no units', (_, act) => {
      act(component);

      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should show a message instead of the export dialog when the workspace has no units', () => {
      component.exportUnit();

      expect(mockDialog.open).toHaveBeenCalledTimes(1);
      expect(mockDialog.open).toHaveBeenCalledWith(MessageDialogComponent, expect.objectContaining({
        data: expect.objectContaining({ content: 'workspace.no-units' })
      }));
    });
  });

  describe('with units', () => {
    beforeEach(() => {
      mockWorkspaceService.unitList = { '': [] };
    });

    it('should start no download when the export dialog is dismissed', () => {
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ExportUnitComponent>>({
        afterClosed: () => of(false)
      }));

      component.exportUnit();

      expect(mockWorkspaceBackendService.downloadUnits).not.toHaveBeenCalled();
      expect(mockWorkspaceBackendService.downloadUnitsJson).not.toHaveBeenCalled();
      expect(mockAppService.dataLoading).toBe(false);
    });

    describe('printUnits', () => {
      let windowOpen: jest.SpyInstance;

      beforeEach(() => {
        mockWorkspaceService.groupId = 5;
        mockRouter.serializeUrl.mockReturnValue('/print?unitIds=3');
        windowOpen = jest.spyOn(window, 'open').mockImplementation(() => null);
      });

      afterEach(() => windowOpen.mockRestore());

      it('should open the print view with the chosen settings in a new tab', () => {
        const printSettings = { printPreviewHeight: 800, printOptions: ['printMetadata'], unitIds: [3, 4] };
        mockDialog.open.mockReturnValue(createMock<MatDialogRef<PrintUnitsDialogComponent>>({
          afterClosed: () => of(printSettings)
        }));

        component.printUnits();

        expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/print'], {
          queryParams: { ...printSettings, workspaceId: 1, workspaceGroupId: 5 }
        });
        expect(windowOpen).toHaveBeenCalledWith('#/print?unitIds=3', '_blank');
      });

      it('should open no print view when the print dialog is cancelled', () => {
        mockDialog.open.mockReturnValue(createMock<MatDialogRef<PrintUnitsDialogComponent>>({
          afterClosed: () => of(false)
        }));

        component.printUnits();

        expect(windowOpen).not.toHaveBeenCalled();
      });
    });

    it('should report the metadata of the selected units only', fakeAsync(() => {
      const unitProperties = (id: number): UnitPropertiesDto => ({ id, key: `U${id}` });
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ShowMetadataComponent>>({
        afterClosed: () => of({ selectedUnits: [2] })
      }));
      mockMetadataService.loadProfileColumns.mockResolvedValue();
      mockMetadataService.createMetadataReport.mockReturnValue(of([unitProperties(1), unitProperties(2)]));

      component.showMetadata();
      flush();

      expect(mockDialog.open).toHaveBeenLastCalledWith(TableViewComponent, expect.objectContaining({
        data: { units: [unitProperties(2)], warning: '' }
      }));
    }));

    it('should load no report when the metadata dialog is cancelled', fakeAsync(() => {
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<ShowMetadataComponent>>({
        afterClosed: () => of(false)
      }));

      component.showMetadata();
      flush();

      expect(mockMetadataService.loadProfileColumns).not.toHaveBeenCalled();
      expect(mockDialog.open).toHaveBeenCalledTimes(1);
    }));
  });

  it('should list the users the backend sends for the workspace', () => {
    const users: UsersInWorkspaceDto = { users: [], workspaceGroupAdmins: [], admins: [] };
    mockWorkspaceBackendService.getUsersList.mockReturnValue(of(users));

    component.userList();

    expect(mockWorkspaceBackendService.getUsersList).toHaveBeenCalledWith(1);
    expect(mockDialog.open).toHaveBeenCalledWith(WorkspaceUserListComponent, expect.objectContaining({
      data: { title: 'workspace.user-list', users }
    }));
  });

  it('should open no user list when the backend refuses it', () => {
    mockWorkspaceBackendService.getUsersList.mockReturnValue(of(false));

    component.userList();

    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it.each([[true, 1], [false, 0]])(
    'should open the group management only when the open unit could be left (%s)',
    async (routingOk, opened) => {
      mockRouter.navigate.mockResolvedValue(routingOk);
      mockDialog.open.mockReturnValue(createMock<MatDialogRef<GroupManageComponent>>({
        afterClosed: () => of(undefined)
      }));

      await component.manageGroups();

      expect(mockDialog.open).toHaveBeenCalledTimes(opened);
      expect(mockWorkspaceBackendService.getUnitGroups).toHaveBeenCalledTimes(opened);
    });
});
