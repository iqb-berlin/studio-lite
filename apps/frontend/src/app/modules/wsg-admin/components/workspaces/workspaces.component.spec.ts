/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceInListDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { AppService } from '../../../../services/app.service';
import { I18nService } from '../../../../services/i18n.service';
import { EntriesDividerComponent } from '../../../../components/entries-divider/entries-divider.component';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceNamePipe } from '../../pipes/workspace-name.pipe';
import { BackendService } from '../../services/backend.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { RolesHeaderComponent } from '../roles-header/roles-header.component';
import { WorkspaceMenuComponent } from '../workspace-menu/workspace-menu.component';
import { WorkspacesComponent } from './workspaces.component';
import { WorkspaceUserChecked } from '../../models/workspace-user-checked.class';
import { BackendService as AppBackendService } from '../../../../services/backend.service';

@Component({ selector: 'studio-lite-workspace-menu', template: '', standalone: true })
class MockWorkspaceMenuComponent {
  @Input() selectedWorkspaceId!: number;
  @Input() selectedRows!: WorkspaceInListDto[];
  @Input() checkedRows!: WorkspaceInListDto[];
  @Input() workspaces!: WorkspaceInListDto[];
  @Input() isWorkspaceGroupAdmin!: boolean;
  @Input() maxWorkspaceCount!: number;
  @Input() isBackUpWorkspaceGroup!: boolean;
}

@Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
class MockSearchFilterComponent {
  @Input() title!: string;
}

@Component({ selector: 'studio-lite-roles-header', template: '', standalone: true })
class MockRolesHeaderComponent {
  @Input() workspaces: unknown[] = [];
}

@Component({ selector: 'studio-lite-entries-divider', template: '', standalone: true })
class MockEntriesDividerComponent {}

@Pipe({ name: 'workspaceName', standalone: true })
class MockWorkspaceNamePipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(value: string): string { return value; }
}

describe('WorkspacesComponent', () => {
  let component: WorkspacesComponent;
  let fixture: ComponentFixture<WorkspacesComponent>;
  let mockBackendService: {
    getUsers: jest.Mock;
    getWorkspaces: jest.Mock;
    getUsersByWorkspace: jest.Mock;
    setUsersByWorkspace: jest.Mock;
  };
  let mockAppBackendService: {
    setWorkspaceSettings?: jest.Mock;
  };
  let mockWorkspaceBackendService: Record<string, never>;
  let mockWsgAdminService: {
    selectedWorkspaceGroupId: BehaviorSubject<number>;
    selectedWorkspaceGroupName: BehaviorSubject<string>;
  };
  let mockAppService: {
    isWorkspaceGroupAdmin: jest.Mock;
    dataLoading: boolean;
  };
  let mockSnackBar: {
    open: jest.Mock;
  };
  let mockI18nService: Record<string, never>;

  beforeEach(async () => {
    mockBackendService = {
      getUsers: jest.fn().mockReturnValue(of([])),
      getWorkspaces: jest.fn().mockReturnValue(of([])),
      getUsersByWorkspace: jest.fn().mockReturnValue(of([])),
      setUsersByWorkspace: jest.fn().mockReturnValue(of(true))
    };
    mockAppBackendService = {};
    mockWorkspaceBackendService = {};
    mockWsgAdminService = {
      selectedWorkspaceGroupId: new BehaviorSubject<number>(1),
      selectedWorkspaceGroupName: new BehaviorSubject<string>('group1')
    };
    mockAppService = {
      isWorkspaceGroupAdmin: jest.fn().mockReturnValue(true),
      dataLoading: false
    };
    mockSnackBar = {
      open: jest.fn()
    };
    mockI18nService = {};

    await TestBed.configureTestingModule({
      imports: [WorkspacesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppBackendService, useValue: mockAppBackendService },
        { provide: WorkspaceBackendService, useValue: mockWorkspaceBackendService },
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: AppService, useValue: mockAppService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: I18nService, useValue: mockI18nService }
      ]
    })
      .overrideComponent(WorkspacesComponent, {
        remove: {
          imports: [
            WorkspaceMenuComponent,
            SearchFilterComponent,
            RolesHeaderComponent,
            EntriesDividerComponent,
            WorkspaceNamePipe
          ]
        },
        add: {
          imports: [
            MockWorkspaceMenuComponent,
            MockSearchFilterComponent,
            MockRolesHeaderComponent,
            MockEntriesDividerComponent,
            MockWorkspaceNamePipe
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkspacesComponent);
    component = fixture.componentInstance;
  });

  it('should create and init', () => {
    mockBackendService.getUsers.mockReturnValue(of([]));
    mockBackendService.getWorkspaces.mockReturnValue(of([
      {
        id: 1,
        name: 'ws1',
        groupId: 1,
        unitsCount: 0
      } as WorkspaceInListDto
    ]));

    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockBackendService.getUsers).toHaveBeenCalled();
    expect(mockBackendService.getWorkspaces).toHaveBeenCalledWith(1);
    expect(component.workspaces.length).toBe(1);
    expect(component.displayedColumns).toContain('notes');
  });

  it('should render one radio button per access level in each row', () => {
    mockBackendService.getUsers.mockReturnValue(of([
      {
        id: 1, name: 'user1', isAdmin: false, description: ''
      }
    ]));

    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('[data-cy="access-rights-row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0].querySelectorAll('mat-radio-button.access-rights-radio')).toHaveLength(3);
    expect(rows[0].querySelector('[data-cy="access-rights-radio-button-1"]')).toBeTruthy();
    expect(rows[0].querySelector('[data-cy="access-rights-radio-button-2"]')).toBeTruthy();
    expect(rows[0].querySelector('[data-cy="access-rights-radio-button-4"]')).toBeTruthy();
  });

  it('should handle workspace selection', () => {
    fixture.detectChanges();
    const ws = {
      id: 1,
      name: 'ws1',
      groupId: 1,
      unitsCount: 0
    } as WorkspaceInListDto;
    component.workspaces = [ws];

    component.tableSelectionRow.select(ws);

    expect(component.selectedWorkspaceId).toBe(1);
    expect(mockBackendService.getUsersByWorkspace).toHaveBeenCalledWith(1);
  });

  describe('while the rights of the selected workspace load', () => {
    const ws1 = {
      id: 1, name: 'ws1', groupId: 1, unitsCount: 0
    } as WorkspaceInListDto;
    const ws2 = {
      id: 2, name: 'ws2', groupId: 1, unitsCount: 0
    } as WorkspaceInListDto;
    let usersOfWs1: Subject<WorkspaceUserInListDto[]>;
    let usersOfWs2: Subject<WorkspaceUserInListDto[]>;

    const radioInputs = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('[data-cy="access-rights-row"] input[type="radio"]')
    );

    beforeEach(() => {
      usersOfWs1 = new Subject<WorkspaceUserInListDto[]>();
      usersOfWs2 = new Subject<WorkspaceUserInListDto[]>();
      mockBackendService.getUsers.mockReturnValue(of([
        {
          id: 1, name: 'user1', isAdmin: false, description: ''
        }
      ]));
      mockBackendService.getUsersByWorkspace
        .mockImplementation((id: number) => (id === 1 ? usersOfWs1 : usersOfWs2));
      fixture.detectChanges();
    });

    it('should disable the radio buttons until the rights have arrived', () => {
      component.tableSelectionRow.select(ws1);
      fixture.detectChanges();

      expect(radioInputs()).toHaveLength(3);
      expect(radioInputs().every(input => input.disabled)).toBe(true);

      usersOfWs1.next([]);
      fixture.detectChanges();

      expect(radioInputs().every(input => !input.disabled)).toBe(true);
    });

    it('should ignore role changes and clicks before the rights have arrived', () => {
      component.tableSelectionRow.select(ws1);
      const user = component.workspaceUsers.entries[0];

      component.onRoleChange(user, 2);
      user.isChecked = true;
      user.accessLevel = 2;
      component.onRoleClick(user, 2);

      expect(user.isChecked).toBe(true);
      expect(user.accessLevel).toBe(2);
      expect(component.workspaceUsers.hasChanged).toBe(false);
    });

    it('should not save the edits of the workspace before onto the one still loading', () => {
      component.tableSelectionRow.select(ws1);
      usersOfWs1.next([]);
      component.onRoleChange(component.workspaceUsers.entries[0], 2);
      component.tableSelectionRow.select(ws2);
      fixture.detectChanges();

      expect(component.workspaceUsers.hasChanged).toBe(true);
      expect(fixture.nativeElement
        .querySelector('[data-cy="wsg-admin-access-rights-save-button"]').disabled).toBe(true);

      component.saveUsers();

      expect(mockBackendService.setUsersByWorkspace).not.toHaveBeenCalled();
    });

    it('should drop the late rights of the workspace selected before', () => {
      component.tableSelectionRow.select(ws1);
      component.tableSelectionRow.select(ws2);

      usersOfWs1.next([{
        id: 1, name: 'user1', isAdmin: false, workspaceAccessLevel: 4
      }]);

      expect(component.isLoadingAccessRights).toBe(true);
      expect(component.workspaceUsers.entries[0].isChecked).toBe(false);

      usersOfWs2.next([]);

      expect(component.isLoadingAccessRights).toBe(false);
      expect(mockAppService.dataLoading).toBe(false);
    });

    it('should stop loading when the workspace is deselected before the rights arrive', () => {
      component.tableSelectionRow.select(ws1);
      component.tableSelectionRow.deselect(ws1);

      expect(component.isLoadingAccessRights).toBe(false);
      expect(mockAppService.dataLoading).toBe(false);
      expect(usersOfWs1.observed).toBe(false);
    });
  });

  it('should save users rights', () => {
    fixture.detectChanges();
    component.selectedWorkspaceId = 1;
    Object.defineProperty(component.workspaceUsers, 'hasChanged', { get: () => true });

    component.saveUsers();

    expect(mockBackendService.setUsersByWorkspace).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.changed', '', { duration: 1000 });
  });

  describe('Route Visibility Configurations', () => {
    let ws: WorkspaceInListDto;

    beforeEach(() => {
      ws = {
        id: 1,
        name: 'ws1',
        groupId: 1,
        unitsCount: 0,
        settings: {
          defaultEditor: '', defaultPlayer: '', defaultSchemer: '', hiddenRoutes: ['preview']
        }
      } as WorkspaceInListDto;
      mockAppBackendService.setWorkspaceSettings = jest.fn().mockReturnValue(of(true));
      component.workspaces = [ws];
    });

    it('isRouteHidden should determine correctly', () => {
      expect(component.isRouteHidden(ws, 'preview')).toBe(true);
      expect(component.isRouteHidden(ws, 'editor')).toBe(false);
      expect(component.isRouteHidden(ws, 'notes')).toBe(false);

      ws.settings!.hiddenRoutes!.push('notes');
      expect(component.isRouteHidden(ws, 'notes')).toBe(true);

      ws.settings = undefined;
      expect(component.isRouteHidden(ws, 'editor')).toBe(false);
    });
  });

  describe('onRoleChange and onRoleClick', () => {
    let userEntry: WorkspaceUserChecked;

    beforeEach(() => {
      userEntry = {
        id: 1, name: 'user1', displayName: 'User 1', description: undefined, isChecked: false, accessLevel: 0
      };
      component.selectedWorkspaceId = 1;
      jest.spyOn(component.workspaceUsers, 'updateHasChanged');
    });

    it('should select role level on role change', () => {
      component.onRoleChange(userEntry, 2);

      expect(userEntry.accessLevel).toBe(2);
      expect(userEntry.isChecked).toBe(true);
      expect(component.workspaceUsers.updateHasChanged).toHaveBeenCalled();
    });

    it('should switch role level on role change to a different level', () => {
      userEntry.isChecked = true;
      userEntry.accessLevel = 1;

      component.onRoleChange(userEntry, 4);

      expect(userEntry.accessLevel).toBe(4);
      expect(userEntry.isChecked).toBe(true);
      expect(component.workspaceUsers.updateHasChanged).toHaveBeenCalled();
    });

    it('should deselect role when clicking on the active role level', () => {
      userEntry.isChecked = true;
      userEntry.accessLevel = 2;

      component.onRoleClick(userEntry, 2);

      expect(userEntry.accessLevel).toBe(0);
      expect(userEntry.isChecked).toBe(false);
      expect(component.workspaceUsers.updateHasChanged).toHaveBeenCalled();
    });

    it('should not deselect role when clicking on a different role level', () => {
      userEntry.isChecked = true;
      userEntry.accessLevel = 1;

      component.onRoleClick(userEntry, 2);

      expect(userEntry.accessLevel).toBe(1);
      expect(userEntry.isChecked).toBe(true);
      expect(component.workspaceUsers.updateHasChanged).not.toHaveBeenCalled();
    });

    it('should ignore a role change while no workspace is selected', () => {
      component.selectedWorkspaceId = 0;

      component.onRoleChange(userEntry, 2);

      expect(userEntry.accessLevel).toBe(0);
      expect(userEntry.isChecked).toBe(false);
      expect(component.workspaceUsers.updateHasChanged).not.toHaveBeenCalled();
    });

    it('should ignore a role click while no workspace is selected', () => {
      component.selectedWorkspaceId = 0;
      userEntry.isChecked = true;
      userEntry.accessLevel = 2;

      component.onRoleClick(userEntry, 2);

      expect(userEntry.accessLevel).toBe(2);
      expect(userEntry.isChecked).toBe(true);
      expect(component.workspaceUsers.updateHasChanged).not.toHaveBeenCalled();
    });
  });
});
