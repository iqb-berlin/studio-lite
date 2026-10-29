import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import {
  WorkspaceFullDto, WorkspaceGroupFullDto, WorkspaceInListDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { ConfirmDialogComponent } from '@studio-lite-lib/iqb-components';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { MoveWorkspaceComponent } from '../../../../components/move-workspace/move-workspace.component';
import {
  EditWorkspaceSettingsComponent
} from '../../../../components/edit-workspace-settings/edit-workspace-settings.component';
import { WorkspaceMenuComponent } from './workspace-menu.component';
import { BackendService } from '../../services/backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';

@Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
class MockWrappedIconComponent {
  @Input() icon!: string;
  @Input() token!: string;
}

describe('WorkspaceMenuComponent', () => {
  let component: WorkspaceMenuComponent;
  let fixture: ComponentFixture<WorkspaceMenuComponent>;
  let mockBackendService: {
    getWorkspaceGroupsByUser: jest.Mock;
  };
  let mockAppBackendService: {
    getWorkspaceGroupList: jest.Mock;
    getAuthData: jest.Mock;
    getWorkspaceData: jest.Mock;
  };
  let mockMatDialog: {
    open: jest.Mock;
  };

  beforeEach(async () => {
    mockBackendService = {
      getWorkspaceGroupsByUser: jest.fn().mockReturnValue(of([]))
    };
    mockAppBackendService = {
      getWorkspaceGroupList: jest.fn().mockReturnValue(of([])),
      getAuthData: jest.fn().mockReturnValue(of({ userId: 1 })),
      getWorkspaceData: jest.fn().mockReturnValue(of(null))
    };
    mockMatDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    };

    await TestBed.configureTestingModule({
      imports: [WorkspaceMenuComponent, TranslateModule.forRoot()],
      providers: [
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppBackendService, useValue: mockAppBackendService },
        { provide: MatDialog, useValue: mockMatDialog }
      ]
    })
      .overrideComponent(WorkspaceMenuComponent, {
        remove: { imports: [WrappedIconComponent] },
        add: { imports: [MockWrappedIconComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkspaceMenuComponent);
    component = fixture.componentInstance;
    component.workspaces = [];
    component.selectedRows = [];
    component.isBackUpWorkspaceGroup = false;
    fixture.detectChanges();
  });

  it('should open add object dialog and emit event', () => {
    mockMatDialog.open.mockReturnValue({
      afterClosed: () => of('new-workspace')
    });
    jest.spyOn(component.workspaceAdded, 'emit');

    component.addObject();

    expect(mockMatDialog.open).toHaveBeenCalled();
    expect(component.workspaceAdded.emit).toHaveBeenCalledWith('new-workspace');
  });

  it('should rename workspace', () => {
    const workspace = { id: 1, name: 'ws1' } as WorkspaceInListDto;
    component.selectedRows = [workspace];

    mockMatDialog.open.mockReturnValue({
      afterClosed: () => of('renamed-workspace')
    });
    jest.spyOn(component.workspaceRenamed, 'emit');

    component.renameObject();

    expect(mockMatDialog.open).toHaveBeenCalled();
    expect(component.workspaceRenamed.emit).toHaveBeenCalledWith({
      selection: [workspace],
      name: 'renamed-workspace'
    });
  });

  const workspace = (id: number, name: string): WorkspaceInListDto => ({
    id, name, groupId: 1, dropBoxId: 0, unitsCount: 0
  });
  const ws1 = workspace(1, 'ws1');
  const ws2 = workspace(2, 'ws2');
  const groups: WorkspaceGroupFullDto[] = [{ id: 1, name: 'group1' }, { id: 7, name: 'group7' }];

  const closeDialogWith = (result: unknown) => mockMatDialog.open.mockReturnValue({ afterClosed: () => of(result) });

  it('should only report the limit when a new workspace would overfill the backup group', () => {
    component.isBackUpWorkspaceGroup = true;
    component.maxWorkspaceCount = 2;
    component.workspaces = [ws1, ws2];
    closeDialogWith('new-workspace');
    jest.spyOn(component.workspaceAdded, 'emit');

    component.addObject();

    expect(mockMatDialog.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(component.workspaceAdded.emit).not.toHaveBeenCalled();
  });

  it.each<[string, boolean, WorkspaceInListDto[]]>([
    ['a backup group below the limit', true, [ws1]],
    ['a group that is no backup group', false, [ws1, ws2]]
  ])('should ask for the name of a new workspace in %s', (_, isBackUpWorkspaceGroup, workspaces) => {
    component.isBackUpWorkspaceGroup = isBackUpWorkspaceGroup;
    component.maxWorkspaceCount = 2;
    component.workspaces = workspaces;

    component.addObject();

    expect(mockMatDialog.open).toHaveBeenCalledWith(InputTextComponent, expect.anything());
  });

  it.each<[string, WorkspaceInListDto[], string]>([
    ['one workspace by its name', [ws1], 'wsg-admin.move-workspace-with-units'],
    ['several workspaces by their number', [ws1, ws2], 'wsg-admin.move-workspaces']
  ])('should offer the groups of the user for moving %s', (_, selectedRows, content) => {
    mockBackendService.getWorkspaceGroupsByUser.mockReturnValue(of(groups));
    closeDialogWith(7);
    component.selectedRows = selectedRows;
    jest.spyOn(component.workspaceMoved, 'emit');

    component.moveObject();

    expect(mockMatDialog.open).toHaveBeenCalledWith(MoveWorkspaceComponent, expect.objectContaining({
      data: expect.objectContaining({ content, workspaceGroups: groups })
    }));
    expect(component.workspaceMoved.emit).toHaveBeenCalledWith({ selection: selectedRows, workspaceGroupId: 7 });
  });

  it('should only say that there is no other group when the user administers just this one', () => {
    mockBackendService.getWorkspaceGroupsByUser.mockReturnValue(of([groups[0]]));
    closeDialogWith(1);
    component.selectedRows = [ws1];
    jest.spyOn(component.workspaceMoved, 'emit');

    component.moveObject();

    expect(mockMatDialog.open).toHaveBeenCalledWith(MoveWorkspaceComponent, expect.objectContaining({
      data: expect.objectContaining({ content: 'wsg-admin.move-workspaces-no-workspace-groups-hint' })
    }));
    expect(component.workspaceMoved.emit).not.toHaveBeenCalled();
  });

  type ShownSettings = WorkspaceSettingsDto & { profile?: string };
  const storedSettings: WorkspaceSettingsDto = {
    defaultEditor: 'editor', defaultPlayer: 'player', defaultSchemer: 'schemer', stableModulesOnly: false
  };
  const defaultSettings: ShownSettings = {
    defaultEditor: '', defaultPlayer: '', defaultSchemer: '', unitGroups: [], stableModulesOnly: true, profile: ''
  };

  it.each<[string, WorkspaceSettingsDto | undefined, ShownSettings]>([
    ['its stored settings', storedSettings, storedSettings],
    ['the default settings when it has none', undefined, defaultSettings]
  ])('should open the settings of a workspace with %s', (_, settings, shown) => {
    const workspaceData: WorkspaceFullDto = { id: 1, dropBoxId: 0, settings };
    mockAppBackendService.getWorkspaceData.mockReturnValue(of(workspaceData));
    const changedSettings: ShownSettings = { ...shown, defaultPlayer: 'other-player' };
    closeDialogWith(changedSettings);
    component.selectedRows = [ws1];
    jest.spyOn(component.workspaceChanged, 'emit');

    component.changeObject();

    expect(mockMatDialog.open).toHaveBeenCalledWith(EditWorkspaceSettingsComponent, expect.objectContaining({
      data: { settings: shown, selectedRow: ws1 }
    }));
    expect(component.workspaceChanged.emit).toHaveBeenCalledWith({ selection: [ws1], settings: changedSettings });
  });

  it('should report a workspace whose settings could not be loaded', () => {
    component.selectedRows = [ws1];
    jest.spyOn(component.workspaceNotLoaded, 'emit');

    component.changeObject();

    expect(component.workspaceNotLoaded.emit).toHaveBeenCalled();
    expect(mockMatDialog.open).not.toHaveBeenCalled();
  });

  // The drop box dialog saves null for "no drop box"; only its cancel button and Esc give undefined.
  it.each<[string, number | null]>([
    ['another workspace', 2],
    ['no drop box', null]
  ])('should save the choice of %s', (_, dropBoxId) => {
    closeDialogWith(dropBoxId);
    component.selectedRows = [ws1];
    jest.spyOn(component.workspaceDropBoxSelected, 'emit');

    component.selectDropBox();

    expect(component.workspaceDropBoxSelected.emit).toHaveBeenCalledWith({ selection: [ws1], dropBoxId });
  });

  it('should keep the drop box when its dialog is cancelled', () => {
    closeDialogWith(undefined);
    component.selectedRows = [ws1];
    jest.spyOn(component.workspaceDropBoxSelected, 'emit');

    component.selectDropBox();

    expect(component.workspaceDropBoxSelected.emit).not.toHaveBeenCalled();
  });

  type Emitter = 'workspaceAdded' | 'workspaceRenamed' | 'workspaceMoved' | 'workspaceChanged';

  // Esc, a click beside the dialog and navigation close it with undefined, its cancel button with false (#1844).
  describe.each([false, undefined])('when a dialog closes with %s', result => {
    it.each<[string, (menu: WorkspaceMenuComponent) => void, Emitter]>([
      ['add a workspace', menu => menu.addObject(), 'workspaceAdded'],
      ['rename a workspace', menu => menu.renameObject(), 'workspaceRenamed'],
      ['move a workspace', menu => menu.moveObject(), 'workspaceMoved'],
      ['change the settings of a workspace', menu => menu.changeObject(), 'workspaceChanged']
    ])('should not %s', (_, act, emitter) => {
      mockBackendService.getWorkspaceGroupsByUser.mockReturnValue(of(groups));
      mockAppBackendService.getWorkspaceData.mockReturnValue(of({ id: 1, dropBoxId: 0 }));
      closeDialogWith(result);
      component.selectedRows = [ws1];
      jest.spyOn(component[emitter], 'emit');

      act(component);

      expect(mockMatDialog.open).toHaveBeenCalled();
      expect(component[emitter].emit).not.toHaveBeenCalled();
    });
  });
});
