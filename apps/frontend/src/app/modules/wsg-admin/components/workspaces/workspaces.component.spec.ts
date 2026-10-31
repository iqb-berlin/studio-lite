/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceInListDto, WorkspaceUserInListDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
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
    deleteWorkspaces: jest.Mock;
    moveWorkspaces: jest.Mock;
    addWorkspace: jest.Mock;
    selectWorkspaceDropBox: jest.Mock;
    renameWorkspace: jest.Mock;
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
      setUsersByWorkspace: jest.fn().mockReturnValue(of(true)),
      deleteWorkspaces: jest.fn().mockReturnValue(of(false)),
      moveWorkspaces: jest.fn().mockReturnValue(of(false)),
      addWorkspace: jest.fn().mockReturnValue(of(false)),
      selectWorkspaceDropBox: jest.fn().mockReturnValue(of(false)),
      renameWorkspace: jest.fn().mockReturnValue(of(false))
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
    let usersOfWs1: Subject<WorkspaceUserInListDto[] | null>;
    let usersOfWs2: Subject<WorkspaceUserInListDto[] | null>;

    const radioInputs = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('[data-cy="access-rights-row"] input[type="radio"]')
    );

    beforeEach(() => {
      usersOfWs1 = new Subject<WorkspaceUserInListDto[] | null>();
      usersOfWs2 = new Subject<WorkspaceUserInListDto[] | null>();
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

    // Without them the workspace had no users, and saving one role removed everyone else from it
    // (#2074).
    it('should keep the roles locked when the rights could not be loaded', () => {
      const notLoadedHint = (): HTMLElement | null => fixture.nativeElement
        .querySelector('[data-cy="wsg-admin-access-rights-not-loaded"]');
      component.tableSelectionRow.select(ws1);
      usersOfWs1.next(null);
      fixture.detectChanges();

      expect(notLoadedHint()).not.toBeNull();
      expect(radioInputs()).toHaveLength(0);
      expect(mockAppService.dataLoading).toBe(false);

      const user = component.workspaceUsers.entries[0];
      component.onRoleChange(user, 2);

      expect(component.workspaceUsers.hasChanged).toBe(false);

      user.isChecked = true;
      user.accessLevel = 2;
      component.onRoleClick(user, 2);

      expect(user.isChecked).toBe(true);

      component.workspaceUsers.updateHasChanged();
      fixture.detectChanges();

      expect(fixture.nativeElement
        .querySelector('[data-cy="wsg-admin-access-rights-save-button"]').disabled).toBe(true);

      component.saveUsers();

      expect(mockBackendService.setUsersByWorkspace).not.toHaveBeenCalled();

      component.tableSelectionRow.deselect(ws1);
      fixture.detectChanges();

      expect(notLoadedHint()).toBeNull();

      component.tableSelectionRow.select(ws2);
      usersOfWs2.next([]);
      fixture.detectChanges();

      expect(radioInputs().every(input => !input.disabled)).toBe(true);
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

  it('should show a failed deletion for three seconds', () => {
    const dialog = (component as unknown as { deleteConfirmDialog: MatDialog }).deleteConfirmDialog;
    jest.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as MatDialogRef<unknown>);

    component.deleteWorkspace({ id: 3, name: 'ws3' } as WorkspaceInListDto);

    expect(mockBackendService.deleteWorkspaces).toHaveBeenCalledWith([3]);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-admin.workspaces-not-deleted', 'error', { duration: 3000 });
    expect(mockAppService.dataLoading).toBe(false);
  });

  it('should show a failed move for three seconds', () => {
    component.moveWorkspace({ selection: [{ id: 3 } as WorkspaceInListDto], workspaceGroupId: 2 });

    expect(mockBackendService.moveWorkspaces).toHaveBeenCalledWith(2, [3]);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-admin.workspaces-not-moved', 'error', { duration: 3000 });
    expect(mockAppService.dataLoading).toBe(false);
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

  const workspace = (id: number, name: string, unitsCount: number): WorkspaceInListDto => ({
    id, name, groupId: 1, dropBoxId: 0, unitsCount
  });

  const closeConfirmationWith = (result: boolean | undefined) => jest.spyOn(TestBed.inject(MatDialog), 'open')
    .mockReturnValue({ afterClosed: () => of(result) } as MatDialogRef<unknown>);

  it('should keep the rights unsaved when saving them fails', () => {
    mockBackendService.getUsers.mockReturnValue(of([{ id: 1, name: 'user1', isAdmin: false }]));
    mockBackendService.setUsersByWorkspace.mockReturnValue(of(false));
    fixture.detectChanges();
    component.tableSelectionRow.select(workspace(1, 'ws1', 0));
    component.onRoleChange(component.workspaceUsers.entries[0], 2);

    component.saveUsers();
    fixture.detectChanges();

    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.not-changed', 'error', { duration: 3000 });
    expect(fixture.nativeElement
      .querySelector('[data-cy="wsg-admin-access-rights-save-button"]').disabled).toBe(false);
  });

  it.each<[string, string, string[]]>([
    ['part of the name in any case', 'mat', ['Mathe']],
    ['the id', '25', ['Deutsch']],
    ['the number of units', '12', ['Mathe']]
  ])('should find workspaces by %s', (_, filter, names) => {
    mockBackendService.getWorkspaces.mockReturnValue(of([workspace(3, 'Mathe', 12), workspace(25, 'Deutsch', 0)]));
    fixture.detectChanges();

    component.objectsDatasource.filter = filter;

    expect(component.objectsDatasource.filteredData.map(ws => ws.name)).toEqual(names);
  });

  it('should add up the units of all workspaces of the group', () => {
    mockBackendService.getWorkspaces
      .mockReturnValue(of([workspace(1, 'a', 3), workspace(2, 'b', 4), workspace(3, 'c', 0)]));

    fixture.detectChanges();

    expect(component.unitsCount).toBe(7);
  });

  it.each<[string, number, string]>([
    ['its units when it has some', 3, 'wsg-admin.delete-workspace-with-units'],
    ['no units when it has none', 0, 'wsg-admin.delete-workspace']
  ])('should name %s before a workspace is deleted', (_, unitsCount, content) => {
    const open = closeConfirmationWith(false);

    component.deleteWorkspace(workspace(3, 'ws3', unitsCount));

    expect(open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.objectContaining({
      data: expect.objectContaining({ content })
    }));
  });

  // Esc, a click beside the dialog and navigation close it with undefined (#1844)
  it.each([false, undefined])('should not delete a workspace when the confirmation closes with %s', result => {
    closeConfirmationWith(result);

    component.deleteWorkspace(workspace(3, 'ws3', 0));

    expect(mockBackendService.deleteWorkspaces).not.toHaveBeenCalled();
  });

  const ws = workspace(3, 'ws3', 0);

  it.each<[string, (workspaces: WorkspacesComponent) => void]>([
    ['deleting a workspace', workspaces => workspaces.deleteWorkspace(ws)],
    ['moving workspaces', workspaces => workspaces.moveWorkspace({ selection: [ws], workspaceGroupId: 2 })],
    ['adding a workspace', workspaces => workspaces.addWorkspace('new')],
    ['choosing a drop box', workspaces => workspaces.selectDropBox({ selection: [ws], dropBoxId: 2 })],
    ['renaming a workspace', workspaces => workspaces.renameWorkspace({ selection: [ws], name: 'new' })]
  ])('should reload the workspaces after %s', (_, act) => {
    closeConfirmationWith(true);
    mockBackendService.deleteWorkspaces.mockReturnValue(of(true));
    mockBackendService.moveWorkspaces.mockReturnValue(of(true));
    mockBackendService.addWorkspace.mockReturnValue(of(true));
    mockBackendService.selectWorkspaceDropBox.mockReturnValue(of(true));
    mockBackendService.renameWorkspace.mockReturnValue(of(true));

    act(component);

    expect(mockBackendService.getWorkspaces).toHaveBeenCalledWith(1);
  });

  type Change = 'addWorkspace' | 'selectWorkspaceDropBox' | 'renameWorkspace';
  it.each<[string, (workspaces: WorkspacesComponent) => void, Change, string]>([
    ['adding', workspaces => workspaces.addWorkspace('new'), 'addWorkspace', 'wsg-admin.workspace-not-added'],
    [
      'choosing a drop box',
      workspaces => workspaces.selectDropBox({ selection: [ws], dropBoxId: 2 }),
      'selectWorkspaceDropBox',
      'wsg-admin.drop-box-not-selected'
    ],
    [
      'renaming',
      workspaces => workspaces.renameWorkspace({ selection: [ws], name: 'new' }),
      'renameWorkspace',
      'wsg-admin.workspace-not-renamed'
    ]
  ])('should say when %s fails and keep the list', (_, act, method, message) => {
    act(component);

    expect(mockBackendService[method]).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith(message, 'error', { duration: 3000 });
    expect(mockBackendService.getWorkspaces).not.toHaveBeenCalled();
    expect(mockAppService.dataLoading).toBe(false);
  });

  it.each<[string, boolean, string, string, string, number]>([
    ['the new settings once they are saved', true, 'new', 'wsg-admin.workspace-settings-changed', '', 1000],
    ['the old settings when saving fails', false, 'old', 'wsg-admin.workspace-settings-not-changed', 'error', 3000]
  ])('should keep %s', (_, isOk, kept, message, label, duration) => {
    const oldSettings = { defaultEditor: 'old', defaultPlayer: '', defaultSchemer: '' };
    const newSettings = { defaultEditor: 'new', defaultPlayer: '', defaultSchemer: '' };
    const row: WorkspaceInListDto = { ...ws, settings: oldSettings };
    mockAppBackendService.setWorkspaceSettings = jest.fn().mockReturnValue(of(isOk));

    component.changeWorkspace({ selection: [row], settings: newSettings });

    expect(row.settings?.defaultEditor).toBe(kept);
    expect(mockSnackBar.open).toHaveBeenCalledWith(message, label, { duration });
  });
});
