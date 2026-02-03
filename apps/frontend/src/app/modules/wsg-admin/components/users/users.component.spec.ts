/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of, BehaviorSubject } from 'rxjs';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';
import { RolesHeaderComponent } from '../roles-header/roles-header.component';
import { EntriesDividerComponent } from '../../../shared/components/entries-divider/entries-divider.component';
import { UsersComponent } from './users.component';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WsgAdminService } from '../../services/wsg-admin.service';

// Mock components
@Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
class MockSearchFilterComponent {
  @Input() title!: string;
  @Output() query = new EventEmitter<string>();
}

@Component({ selector: 'studio-lite-roles-header', template: '', standalone: true })
class MockRolesHeaderComponent {
  @Input() workspaces: unknown[] = [];
}

@Component({ selector: 'studio-lite-entries-divider', template: '', standalone: true })
class MockEntriesDividerComponent {}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockBackendService: {
    getWorkspaces: jest.Mock;
    getUsersFull: jest.Mock;
    getWorkspacesByUser: jest.Mock;
    setWorkspacesByUser: jest.Mock;
  };
  let mockAppService: {
    dataLoading: boolean;
  };
  let mockWsgAdminService: {
    selectedWorkspaceGroupId: BehaviorSubject<number>;
  };
  let mockSnackBar: {
    open: jest.Mock;
  };

  beforeEach(async () => {
    mockBackendService = {
      getWorkspaces: jest.fn().mockReturnValue(of([])),
      getUsersFull: jest.fn().mockReturnValue(of([])),
      getWorkspacesByUser: jest.fn().mockReturnValue(of([])),
      setWorkspacesByUser: jest.fn().mockReturnValue(of(true))
    };
    mockAppService = {
      dataLoading: false
    };
    mockWsgAdminService = {
      selectedWorkspaceGroupId: new BehaviorSubject<number>(1)
    };
    mockSnackBar = {
      open: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UsersComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    })
      .overrideComponent(UsersComponent, {
        remove: { imports: [SearchFilterComponent, RolesHeaderComponent, EntriesDividerComponent] },
        add: { imports: [MockSearchFilterComponent, MockRolesHeaderComponent, MockEntriesDividerComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create and load data on init', () => {
    const users: UserFullDto[] = [
      {
        id: 1,
        name: 'user1',
        firstName: 'F1',
        lastName: 'L1',
        email: 'u1@test.com',
        isAdmin: false,
        description: ''
      }
    ];
    const workspaces = [{ id: 1, name: 'ws1', groupId: 1 }];

    mockBackendService.getWorkspaces.mockReturnValue(of(workspaces));
    mockBackendService.getUsersFull.mockReturnValue(of(users));

    fixture.detectChanges(); // calls ngOnInit

    expect(component).toBeTruthy();
    expect(mockBackendService.getWorkspaces).toHaveBeenCalledWith(1);
    expect(mockBackendService.getUsersFull).toHaveBeenCalled();
    expect(component.objectsDatasource.data).toEqual(users);
  });

  it('should load user workspaces on selection', () => {
    fixture.detectChanges();
    const user: UserFullDto = {
      id: 1,
      name: 'user1',
      firstName: 'F1',
      lastName: 'L1',
      email: 'u1@test.com',
      isAdmin: false,
      description: ''
    };

    component.tableSelectionRow.select(user);

    expect(component.selectedUser).toBe(1);
    expect(mockBackendService.getWorkspacesByUser).toHaveBeenCalledWith(1);
  });

  it('should set selectedUser to 0 when deselected', () => {
    fixture.detectChanges();
    const user: UserFullDto = {
      id: 1,
      name: 'user1',
      firstName: 'F1',
      lastName: 'L1',
      email: 'u1@test.com',
      isAdmin: false,
      description: ''
    };

    component.tableSelectionRow.select(user);
    component.tableSelectionRow.deselect(user);

    expect(component.selectedUser).toBe(0);
  });

  it('should save workspaces successfully', () => {
    fixture.detectChanges();
    component.selectedUser = 1;
    // manually set changed to true to pass the check
    Object.defineProperty(component.userWorkspaces, 'hasChanged', { get: () => true });

    component.saveWorkspaces();

    expect(mockBackendService.setWorkspacesByUser).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.changed', '', { duration: 1000 });
  });

  it('should handle save error', () => {
    fixture.detectChanges();
    component.selectedUser = 1;
    Object.defineProperty(component.userWorkspaces, 'hasChanged', { get: () => true });
    mockBackendService.setWorkspacesByUser.mockReturnValue(of(false));

    component.saveWorkspaces();

    expect(mockBackendService.setWorkspacesByUser).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.not-changed', 'error', { duration: 3000 });
  });
});
