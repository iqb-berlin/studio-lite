import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';
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

  it('should create', () => {
    expect(component).toBeTruthy();
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
});
