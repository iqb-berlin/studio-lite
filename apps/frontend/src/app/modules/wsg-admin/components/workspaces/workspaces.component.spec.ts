/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
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
  let mockAppBackendService: Record<string, never>;
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

  it('should save users rights', () => {
    fixture.detectChanges();
    component.selectedWorkspaceId = 1;
    Object.defineProperty(component.workspaceUsers, 'hasChanged', { get: () => true });

    component.saveUsers();

    expect(mockBackendService.setUsersByWorkspace).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.changed', '', { duration: 1000 });
  });
});
