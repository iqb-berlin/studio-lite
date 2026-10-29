import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { AuthDataDto, WorkspaceGroupDto, WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
import { WorkspaceMenuComponent } from './workspace-menu.component';
import { BackendService } from '../../services/backend.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { MoveWorkspaceComponent } from '../../../../components/move-workspace/move-workspace.component';

@Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
class MockWrappedIconComponent {
  @Input() icon!: string;
  @Input() token!: string;
}

describe('WorkspaceMenuComponent', () => {
  let component: WorkspaceMenuComponent;
  let fixture: ComponentFixture<WorkspaceMenuComponent>;
  let mockBackendService: Record<string, never>;
  let mockAppBackendService: {
    getWorkspaceGroupList: jest.Mock;
    getAuthData: jest.Mock;
  };
  let mockMatDialog: {
    open: jest.Mock;
  };

  beforeEach(async () => {
    mockBackendService = {};
    mockAppBackendService = {
      getWorkspaceGroupList: jest.fn().mockReturnValue(of([])),
      getAuthData: jest.fn().mockReturnValue(of({ userId: 1 }))
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

  describe('moveObject', () => {
    const group = (id: number, isAdmin: boolean) => ({ id, name: `g${id}`, isAdmin } as WorkspaceGroupDto);
    const authDataWith = (workspaces: WorkspaceGroupDto[]) => of({ userId: 1, workspaces } as AuthDataDto);

    beforeEach(() => {
      component.selectedRows = [{ id: 7, name: 'ws7' } as WorkspaceInListDto];
    });

    it('should offer the groups the user administers as targets (#1984)', () => {
      mockAppBackendService.getAuthData
        .mockReturnValue(authDataWith([group(1, true), group(2, false), group(3, true)]));
      mockMatDialog.open.mockReturnValue({ afterClosed: () => of(3) });
      jest.spyOn(component.workspaceMoved, 'emit');

      component.moveObject();

      expect(mockMatDialog.open).toHaveBeenCalledWith(MoveWorkspaceComponent, expect.objectContaining({
        data: expect.objectContaining({ workspaceGroups: [group(1, true), group(3, true)] })
      }));
      expect(component.workspaceMoved.emit).toHaveBeenCalledWith({
        selection: component.selectedRows,
        workspaceGroupId: 3
      });
    });

    it('should show the hint and move nothing when the user administers only one group', () => {
      mockAppBackendService.getAuthData.mockReturnValue(authDataWith([group(1, true), group(2, false)]));
      jest.spyOn(component.workspaceMoved, 'emit');

      component.moveObject();

      expect(mockMatDialog.open).toHaveBeenCalledWith(MoveWorkspaceComponent, expect.objectContaining({
        data: expect.objectContaining({ content: 'wsg-admin.move-workspaces-no-workspace-groups-hint' })
      }));
      expect(component.workspaceMoved.emit).not.toHaveBeenCalled();
    });
  });
});
