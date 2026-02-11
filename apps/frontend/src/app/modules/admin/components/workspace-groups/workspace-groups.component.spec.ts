// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import {
  WorkspaceGroupInListDto, UserInListDto
} from '@studio-lite-lib/api-dto';
import { UntypedFormGroup, FormControl } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { WorkspaceGroupsComponent } from './workspace-groups.component';
import { environment } from '../../../../../environments/environment';
import { AppService } from '../../../../services/app.service';
import { AppConfig } from '../../../../classes/app-config.class';
import { BackendService } from '../../services/backend.service';
import { I18nService } from '../../../../services/i18n.service';
import { WorkspaceGroupsMenuComponent } from '../workspace-groups-menu/workspace-groups-menu.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

describe('WorkspaceGroupsComponent', () => {
  let component: WorkspaceGroupsComponent;
  let fixture: ComponentFixture<WorkspaceGroupsComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockAppService: Partial<AppService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockI18nService: Partial<I18nService>;

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-workspace-groups-menu', template: '', standalone: true })
  class MockWorkspaceGroupsMenuComponent {
    @Input() selectedWorkspaceGroupId!: number;
    @Input() selectedRows!: WorkspaceGroupInListDto[];
    @Input() checkedRows!: WorkspaceGroupInListDto[];

    @Output() groupAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
    @Output() groupsDeleted: EventEmitter<WorkspaceGroupInListDto[]> = new EventEmitter<WorkspaceGroupInListDto[]>();
    @Output() groupEdited: EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }> =
      new EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }>();

    @Output() groupSettingsEdited = new EventEmitter();
    @Output() downloadUnits = new EventEmitter();
    @Output() downloadWorkspacesReport = new EventEmitter();
  }

  beforeEach(async () => {
    mockBackendService = {
      getWorkspaceGroupAdmins: jest.fn().mockReturnValue(of([])),
      setWorkspaceGroupAdmins: jest.fn().mockReturnValue(of(true)),
      getWorkspaceGroupList: jest.fn().mockReturnValue(of([])),
      getUsers: jest.fn().mockReturnValue(of([])),
      addWorkspaceGroup: jest.fn().mockReturnValue(of(true)),
      changeWorkspaceGroup: jest.fn().mockReturnValue(of(true)),
      setWorkspaceGroupProfiles: jest.fn().mockReturnValue(of(true)),
      deleteWorkspaceGroups: jest.fn().mockReturnValue(of(true)),
      getUnits: jest.fn().mockReturnValue(of([])),
      getXlsWorkspaces: jest.fn().mockReturnValue(of(new Blob(['content'])))
    };

    mockAppService = {
      dataLoading: false,
      appConfig: {
        setPageTitle: jest.fn()
      } as unknown as AppConfig
    };

    mockSnackBar = {
      open: jest.fn()
    };

    mockI18nService = {
      fullLocale: 'en-US',
      fileDateFormat: 'yyyy-MM-dd'
    };

    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatIconModule,
        MatTableModule,
        TranslateModule.forRoot(),
        WorkspaceGroupsComponent,
        MockWorkspaceGroupsMenuComponent,
        MockSearchFilterComponent
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: I18nService, useValue: mockI18nService }
      ]
    })
      .overrideComponent(WorkspaceGroupsComponent, {
        remove: { imports: [WorkspaceGroupsMenuComponent, SearchFilterComponent] },
        add: { imports: [MockWorkspaceGroupsMenuComponent, MockSearchFilterComponent] }
      })
      .compileComponents();

    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => key as string);

    fixture = TestBed.createComponent(WorkspaceGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data', () => {
    jest.useFakeTimers();
    component.ngOnInit();
    jest.runAllTimers();
    expect(mockBackendService.getUsers).toHaveBeenCalled();
    expect(mockBackendService.getWorkspaceGroupList).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should add group', () => {
    const groupData = new UntypedFormGroup({ name: new FormControl('newGroup') });
    component.addGroup(groupData);
    expect(mockBackendService.addWorkspaceGroup).toHaveBeenCalledWith(expect.objectContaining({ name: 'newGroup' }));
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.group-created', '', expect.anything());
    expect(mockBackendService.getWorkspaceGroupList).toHaveBeenCalled();
  });

  it('should edit group', () => {
    const group = { id: 1, name: 'oldGroup' } as WorkspaceGroupInListDto;
    const groupData = new UntypedFormGroup({ name: new FormControl('newGroup') });
    component.editGroup({ selection: [group], group: groupData });
    expect(mockBackendService.changeWorkspaceGroup)
      .toHaveBeenCalledWith(expect.objectContaining({ id: 1, name: 'newGroup' }));
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.group-edited', '', expect.anything());
  });

  it('should edit group settings', () => {
    component.editGroupSettings({ states: [], profiles: [], selectedRow: 1 });
    expect(mockBackendService.setWorkspaceGroupProfiles).toHaveBeenCalledWith(
      expect.anything(), 1
    );
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.group-edited', '', expect.anything());
  });

  it('should delete groups', () => {
    const groups = [{ id: 1 }] as WorkspaceGroupInListDto[];
    component.deleteGroups(groups);
    expect(mockBackendService.deleteWorkspaceGroups).toHaveBeenCalledWith([1]);
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.groups-deleted', '', expect.anything());
  });

  it('should save users', () => {
    const mockUsers = [{ id: 1, name: 'user1' }] as UserInListDto[];
    (mockBackendService.getWorkspaceGroupAdmins as jest.Mock).mockReturnValue(of(mockUsers));

    // Select a group
    component.selectedWorkspaceGroupId = 1;

    // Simulate user change in user collection
    // (mocking collection behavior is tricky without mocking the class, assuming we can trigger change)
    // Actually, we interact with `workspaceUsers`.
    // Let's force hasChanged
    (component.workspaceUsers as unknown as {
      hasChanged: boolean,
      getChecks: () => number[],
      setHasChangedFalse: () => void,
      sortEntries: () => void,
      setChecks: () => void
    }) = {
      hasChanged: true,
      getChecks: jest.fn().mockReturnValue([] as number[]),
      setHasChangedFalse: jest.fn(),
      sortEntries: jest.fn(),
      setChecks: jest.fn()
    };

    component.saveUsers();

    expect(mockBackendService.setWorkspaceGroupAdmins).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.changed', '', expect.anything());
  });

  it('should update user list when group selection changes', () => {
    // We can manually trigger what happens when selection changes or call update user list
    component.selectedWorkspaceGroupId = 123;
    component.workspaceUsers.setChecks = jest.fn(); // Spy

    // Simulate calling update (which is called by subscription usually)
    (component as unknown as { updateUserList: () => void }).updateUserList();

    expect(mockBackendService.getWorkspaceGroupAdmins).toHaveBeenCalledWith(123);
  });

  it('should download units', () => {
    // Mock saveAs? Global mock or window mock needed if we want to verify deeply.
    // Or just check service call.
    // window.saveAs = jest.fn() --> need to mock file-saver-es
    // We will check getUnits call.

    component.downloadUnits();
    expect(mockBackendService.getUnits).toHaveBeenCalled();
  });

  it('should download workspaces report', () => {
    component.xlsxDownloadWorkspaceReport();
    expect(mockBackendService.getXlsWorkspaces).toHaveBeenCalled();
  });
});
