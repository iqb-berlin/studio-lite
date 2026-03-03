// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { UserFullDto, UserInListDto } from '@studio-lite-lib/api-dto';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { AppConfig } from '../../../../classes/app-config.class';
import { WorkspaceGroupToCheckCollection } from '../../models/workspace-group-to-check-collection.class';
import { environment } from '../../../../../environments/environment';
import { UsersComponent } from './users.component';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { UsersMenuComponent } from '../users-menu/users-menu.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockAppService: Partial<AppService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockDialog: Partial<MatDialog>;

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: true })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-users-menu', template: '', standalone: true })
  class MockUsersMenuComponent {
    @Input() selectedUser!: number;
    @Input() selectedRows!: UserFullDto[];

    @Output() userAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
    @Output() userEdited: EventEmitter<{ selection: UserFullDto[], user: UntypedFormGroup }> =
      new EventEmitter<{ selection: UserFullDto[], user: UntypedFormGroup }>();
  }

  beforeEach(async () => {
    mockBackendService = {
      getUsersFull: jest.fn().mockReturnValue(of([])),
      getWorkspaceGroupList: jest.fn().mockReturnValue(of([])),
      addUser: jest.fn().mockReturnValue(of(true)),
      changeUserData: jest.fn().mockReturnValue(of(true)),
      deleteUsers: jest.fn().mockReturnValue(of(true)),
      getWorkspaceGroupsByAdmin: jest.fn().mockReturnValue(of([])),
      setWorkspaceGroupsByAdmin: jest.fn().mockReturnValue(of(true))
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

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    };

    await TestBed.configureTestingModule({
      imports: [
        MatSnackBarModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatIconModule,
        MatTableModule,
        TranslateModule.forRoot(),
        UsersComponent, // Imported here
        MockUsersMenuComponent, // Mocks imported here
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
        { provide: MatDialog, useValue: mockDialog }
      ]
    })
      .overrideComponent(UsersComponent, {
        remove: { imports: [UsersMenuComponent, SearchFilterComponent] },
        add: { imports: [MockUsersMenuComponent, MockSearchFilterComponent] }
      })
      .compileComponents();

    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => key as string);

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data on init', () => {
    jest.useFakeTimers();
    component.ngOnInit();
    jest.runAllTimers();
    expect(mockBackendService.getWorkspaceGroupList).toHaveBeenCalled();
    expect(mockBackendService.getUsersFull).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should add user successfully', () => {
    const userData = new FormGroup({
      name: new FormControl('test'),
      password: new FormControl('pass'),
      isAdmin: new FormControl(false),
      description: new FormControl('desc'),
      firstName: new FormControl('first'),
      lastName: new FormControl('last'),
      email: new FormControl('email@test.com')
    });
    component.addUser(userData);
    expect(mockBackendService.addUser).toHaveBeenCalled();
    expect(mockBackendService.getUsersFull).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-created', '', { duration: 1000 });
  });

  it('should handle add user failure', () => {
    (mockBackendService.addUser as jest.Mock).mockReturnValue(of(false));
    const userData = new FormGroup({
      name: new FormControl('test')
    });
    component.addUser(userData);
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-not-created', 'error', { duration: 3000 });
  });

  it('should edit user successfully', () => {
    const user = {
      id: 1,
      name: 'oldName',
      description: 'oldDesc',
      firstName: 'oldFirst',
      lastName: 'oldLast',
      email: 'old@test.com',
      isAdmin: false
    } as UserFullDto;
    const userData = new FormGroup({
      password: new FormControl('newPass'),
      name: new FormControl('newName'),
      firstName: new FormControl('newFirst'),
      lastName: new FormControl('newLast'),
      email: new FormControl('new@test.com'),
      description: new FormControl('newDesc'),
      isAdmin: new FormControl(true)
    });
    component.editUser({ selection: [user], user: userData });
    expect(mockBackendService.changeUserData).toHaveBeenCalledWith(1, expect.objectContaining({
      name: 'newName',
      description: 'newDesc',
      firstName: 'newFirst',
      lastName: 'newLast',
      email: 'new@test.com',
      isAdmin: true,
      password: 'newPass'
    }));
    expect(mockBackendService.getUsersFull).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-edited', '', { duration: 1000 });
  });

  it('should handle edit user failure', () => {
    (mockBackendService.changeUserData as jest.Mock).mockReturnValue(of(false));
    const user = { id: 1, name: 'oldName' } as UserFullDto;
    const userData = new FormGroup({ name: new FormControl('newName') });
    component.editUser({ selection: [user], user: userData });
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-not-edited', 'error', { duration: 3000 });
  });

  it('should delete users successfully', () => {
    const users = [{ id: 1 }, { id: 2 }] as UserFullDto[];
    component.deleteUsers(users);
    expect(mockBackendService.deleteUsers).toHaveBeenCalledWith([1, 2]);
    expect(mockBackendService.getUsersFull).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.users-deleted', '', { duration: 1000 });
  });

  it('should handle delete users failure', () => {
    (mockBackendService.deleteUsers as jest.Mock).mockReturnValue(of(false));
    const users = [{ id: 1 }] as UserFullDto[];
    component.deleteUsers(users);
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.users-not-deleted', 'error', { duration: 3000 });
  });

  it('should update workspace group list when user is selected', () => {
    const mockGroups = [{ id: 1, name: 'group1' }];
    (mockBackendService.getWorkspaceGroupsByAdmin as jest.Mock).mockReturnValue(of(mockGroups));
    component.selectedUser = 123;
    component.updateWorkspaceGroupList();
    expect(mockBackendService.getWorkspaceGroupsByAdmin).toHaveBeenCalledWith(123);
  });

  it('should warn if workspace group list has changed before update', () => {
    component.userWorkspaceGroups = {
      hasChanged: true,
      setChecks: jest.fn()
    } as unknown as WorkspaceGroupToCheckCollection;
    component.selectedUser = 0;
    component.updateWorkspaceGroupList();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Zugriffsrechte nicht gespeichert.', 'Warnung', { duration: 3000 });
  });

  it('should save workspaces successfully', () => {
    component.selectedUser = 123;
    component.userWorkspaceGroups = {
      hasChanged: true,
      getChecks: jest.fn().mockReturnValue([]),
      setHasChangedFalse: jest.fn(),
      sortEntries: jest.fn()
    } as unknown as WorkspaceGroupToCheckCollection;
    component.saveWorkspaces();
    expect(mockBackendService.setWorkspaceGroupsByAdmin).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Zugriffsrechte geändert', '', { duration: 1000 });
  });

  it('should handle save workspaces failure', () => {
    (mockBackendService.setWorkspaceGroupsByAdmin as jest.Mock).mockReturnValue(of(false));
    component.selectedUser = 123;
    component.userWorkspaceGroups = {
      hasChanged: true,
      getChecks: jest.fn().mockReturnValue([])
    } as unknown as WorkspaceGroupToCheckCollection;
    component.saveWorkspaces();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Konnte Zugriffsrechte nicht ändern', 'Fehler', { duration: 3000 });
  });

  it('should toggle row selection', () => {
    const user = { id: 1, name: 'test' } as unknown as UserInListDto;
    component.toggleRowSelection(user);
    expect(component.tableSelectionRow.isSelected(user)).toBe(true);

    component.toggleRowSelection(user);
    expect(component.tableSelectionRow.isSelected(user)).toBe(false);
  });
});
