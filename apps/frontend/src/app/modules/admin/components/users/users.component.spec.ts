// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { UserFullDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { ADMIN_USER_LIST_POLL_INTERVAL_MS } from '@studio-lite/shared-code';
import { AppConfig } from '../../../../classes/app-config.class';
import { WorkspaceGroupToCheckCollection } from '../../models/workspace-group-to-check-collection.class';
import { environment } from '../../../../../environments/environment';
import { UsersComponent } from './users.component';
import { AppService } from '../../../../services/app.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { BackendService } from '../../services/backend.service';
import { HeartbeatService } from '../../../../services/heartbeat.service';
import { UsersMenuComponent } from '../users-menu/users-menu.component';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockAppService: Partial<AppService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockDialog: Partial<MatDialog>;
  let mockHeartbeatService: Partial<HeartbeatService>;
  let mockAppBackendService: Partial<AppBackendService>;
  let mockRouter: Partial<Router>;

  const setDocumentVisibility = (visibilityState: 'visible' | 'hidden'): void => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: visibilityState
    });
    document.dispatchEvent(new Event('visibilitychange'));
  };

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
      getUsersFullWithActivity: jest.fn().mockReturnValue(of([])),
      getWorkspaceGroupList: jest.fn().mockReturnValue(of([])),
      addUser: jest.fn().mockReturnValue(of(true)),
      changeUserData: jest.fn().mockReturnValue(of(true)),
      deleteUsers: jest.fn().mockReturnValue(of(true)),
      deleteUserSession: jest.fn().mockReturnValue(of(true)),
      deleteUserOrphanedSessions: jest.fn().mockReturnValue(of(true)),
      getWorkspaceGroupsByAdmin: jest.fn().mockReturnValue(of([])),
      setWorkspaceGroupsByAdmin: jest.fn().mockReturnValue(of(true))
    };

    mockAppService = {
      dataLoading: false,
      authData: { ...AppService.defaultAuthData, userId: 7 },
      appConfig: {
        setPageTitle: jest.fn()
      } as unknown as AppConfig,
      getServerTime: jest.fn().mockReturnValue(Date.now())
    };

    mockSnackBar = {
      open: jest.fn()
    };

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    };

    mockHeartbeatService = {
      refreshActivityPulse: jest.fn()
    };

    mockAppBackendService = {
      logout: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true)
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
        { provide: HeartbeatService, useValue: mockHeartbeatService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialog, useValue: mockDialog },
        { provide: AppBackendService, useValue: mockAppBackendService },
        { provide: Router, useValue: mockRouter }
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

  it('should refresh without activity when explicitly requested', () => {
    component.updateUserList(false);

    expect(mockBackendService.getUsersFull).toHaveBeenCalled();
    expect(mockBackendService.getUsersFullWithActivity).not.toHaveBeenCalled();
    expect(mockHeartbeatService.refreshActivityPulse).not.toHaveBeenCalled();
  });

  it('should refresh with activity intent on periodic polling', () => {
    jest.useFakeTimers();
    setDocumentVisibility('visible');
    component.ngOnInit();

    jest.advanceTimersByTime(ADMIN_USER_LIST_POLL_INTERVAL_MS);

    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
    expect(mockHeartbeatService.refreshActivityPulse).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should refresh heartbeat pulse for visible activity-counting refreshes', () => {
    setDocumentVisibility('visible');

    component.updateUserList(false, true);

    expect(mockHeartbeatService.refreshActivityPulse).toHaveBeenCalled();
    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
  });

  it('should not refresh heartbeat pulse while hidden', () => {
    setDocumentVisibility('hidden');

    component.updateUserList(false, true);

    expect(mockHeartbeatService.refreshActivityPulse).not.toHaveBeenCalled();
    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
  });

  it('should not poll when the tab is hidden', () => {
    jest.useFakeTimers();
    setDocumentVisibility('hidden');
    component.ngOnInit();

    jest.runOnlyPendingTimers();

    jest.clearAllMocks();
    jest.advanceTimersByTime(ADMIN_USER_LIST_POLL_INTERVAL_MS * 2);

    expect(mockBackendService.getUsersFullWithActivity).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should resume polling when the tab becomes visible again', () => {
    jest.useFakeTimers();
    setDocumentVisibility('hidden');
    component.ngOnInit();

    jest.runOnlyPendingTimers();

    jest.clearAllMocks();
    jest.advanceTimersByTime(ADMIN_USER_LIST_POLL_INTERVAL_MS);
    expect(mockBackendService.getUsersFullWithActivity).not.toHaveBeenCalled();

    setDocumentVisibility('visible');
    jest.advanceTimersByTime(ADMIN_USER_LIST_POLL_INTERVAL_MS);

    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
    jest.useRealTimers();
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
    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-edited', '', { duration: 1000 });
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockAppBackendService.logout).not.toHaveBeenCalled();
  });

  // The server has ended every session of the account, the administrator's own included (#1901)
  it('should log out when an administrator sets their own password', fakeAsync(() => {
    const user = { id: 7, name: 'admin' } as UserFullDto;
    const userData = new FormGroup({
      name: new FormControl('admin'),
      password: new FormControl('newPass')
    });

    component.editUser({ selection: [user], user: userData });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    flushMicrotasks();

    expect(mockAppBackendService.logout).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('user-profile.new-password', 'user-profile.ok', { duration: 3000 });
    expect(mockBackendService.getUsersFullWithActivity).not.toHaveBeenCalled();
    expect(mockAppService.dataLoading).toBe(false);
  }));

  it('should stay logged in when an administrator changes their own data without a password', fakeAsync(() => {
    const user = { id: 7, name: 'admin' } as UserFullDto;
    const userData = new FormGroup({
      name: new FormControl('newAdmin'),
      password: new FormControl('')
    });

    component.editUser({ selection: [user], user: userData });
    flushMicrotasks();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockAppBackendService.logout).not.toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-edited', '', { duration: 1000 });
  }));

  it('should stay logged in when setting their own password fails', fakeAsync(() => {
    (mockBackendService.changeUserData as jest.Mock).mockReturnValue(of(false));
    const user = { id: 7, name: 'admin' } as UserFullDto;
    const userData = new FormGroup({
      name: new FormControl('admin'),
      password: new FormControl('newPass')
    });

    component.editUser({ selection: [user], user: userData });
    flushMicrotasks();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockAppBackendService.logout).not.toHaveBeenCalled();
  }));

  it('should handle edit user failure', () => {
    (mockBackendService.changeUserData as jest.Mock).mockReturnValue(of(false));
    const user = { id: 1, name: 'oldName' } as UserFullDto;
    const userData = new FormGroup({ name: new FormControl('newName') });
    component.editUser({ selection: [user], user: userData });
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.user-not-edited', 'error', { duration: 3000 });
  });

  it('should delete users successfully', () => {
    const users = [{ id: 1, isLoggedIn: true }, { id: 2, isLoggedIn: false }] as UserFullDto[];
    component.deleteUsers(users);
    expect(mockBackendService.deleteUsers).toHaveBeenCalledWith([1, 2]);
    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('admin.users-deleted', '', { duration: 1000 });
  });

  it('should delete a specific session and refresh the user list', () => {
    const user = {
      id: 1,
      name: 'user1',
      sessions: [{ sessionId: 's1', activityStatus: 'orphaned' }]
    } as UserFullDto;

    component.deleteSession(user, { sessionId: 's1', activityStatus: 'orphaned' });

    expect(mockBackendService.deleteUserSession).toHaveBeenCalledWith(1, 's1');
    expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
  });

  // The dot swallows the click, so the row never becomes selected -- deletion must work
  // from the row it was clicked in.
  it('should delete a session of an unselected row', () => {
    const user = {
      id: 4,
      name: 'user4',
      sessions: [{ sessionId: 's4', activityStatus: 'orphaned' }]
    } as UserFullDto;

    component.deleteSession(user, { sessionId: 's4', activityStatus: 'orphaned' });

    expect(component.tableSelectionRow.isEmpty()).toBe(true);
    expect(mockBackendService.deleteUserSession).toHaveBeenCalledWith(4, 's4');
  });

  it('should not delete non-orphaned sessions', () => {
    const user = {
      id: 1,
      name: 'user1',
      sessions: [{ sessionId: 's1', activityStatus: 'active' }]
    } as UserFullDto;

    component.deleteSession(user, { sessionId: 's1', activityStatus: 'active' });

    expect(mockBackendService.deleteUserSession).not.toHaveBeenCalled();
  });

  describe('deleteOrphanedSessions', () => {
    it('should clear the orphaned sessions of the selected user and refresh the list', () => {
      component.tableSelectionRow.select({
        id: 1,
        name: 'user1',
        sessions: [
          { sessionId: 's1', activityStatus: 'orphaned' },
          { sessionId: 's2', activityStatus: 'active' }
        ]
      } as UserFullDto);

      component.deleteOrphanedSessions();

      expect(mockBackendService.deleteUserOrphanedSessions).toHaveBeenCalledWith(1);
      expect(mockBackendService.getUsersFullWithActivity).toHaveBeenCalled();
    });

    it('should do nothing without a selected user', () => {
      component.deleteOrphanedSessions();

      expect(mockBackendService.deleteUserOrphanedSessions).not.toHaveBeenCalled();
    });
  });

  // The menu decides whether to offer the clear action from the selected row's sessions.
  // CDK's SelectionModel caches its selected array, so that only reaches the menu if the
  // poll really replaces the selection -- which it does by re-selecting the fresh DTO.
  it('should hand on a fresh selection when a poll changes the selected sessions', () => {
    const initial = [{
      id: 1, name: 'u', isLoggedIn: true, sessions: [{ sessionId: 's1', activityStatus: 'active' }]
    }] as UserFullDto[];
    (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of(initial));
    component.updateUserList();
    component.tableSelectionRow.select(component.objectsDatasource.data[0]);
    const selectionBefore = component.tableSelectionRow.selected;
    expect(selectionBefore[0].sessions?.map(s => s.activityStatus)).toEqual(['active']);

    const polled = [{
      id: 1,
      name: 'u',
      isLoggedIn: true,
      sessions: [
        { sessionId: 's1', activityStatus: 'active' },
        { sessionId: 's2', activityStatus: 'orphaned' }
      ]
    }] as UserFullDto[];
    (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of(polled));
    component.updateUserList(false, true);

    expect(component.tableSelectionRow.selected).not.toBe(selectionBefore);
    expect(component.tableSelectionRow.selected[0].sessions?.map(s => s.activityStatus))
      .toEqual(['active', 'orphaned']);
  });

  // A check set before the groups of the selected user arrived was reset by them, and so was one
  // set before a poll selected the fresh row of the same user again (#2056).
  describe('while the groups of the selected user load', () => {
    const groups = [{ id: 1, name: 'g1' }, { id: 2, name: 'g2' }] as WorkspaceGroupInListDto[];
    const users = [{ id: 1, name: 'u1' }, { id: 2, name: 'u2' }] as UserFullDto[];
    let groupsOf1: Subject<WorkspaceGroupInListDto[] | null>;
    let groupsOf2: Subject<WorkspaceGroupInListDto[] | null>;

    const checkboxes = (): HTMLInputElement[] => Array.from(
      fixture.nativeElement.querySelectorAll('mat-checkbox input[type="checkbox"]')
    );
    const saveButton = (): HTMLButtonElement => fixture.nativeElement
      .querySelector('[data-cy="admin-users-save-button"]');
    // ngModel hands a changed disabled on to the checkbox in a promise of its own, which
    // fakeAsync does not reach
    const render = async (): Promise<void> => {
      fixture.detectChanges();
      await Promise.resolve();
      fixture.detectChanges();
    };
    const selectUser = (index: number): void => {
      component.tableSelectionRow.select(component.objectsDatasource.data[index]);
    };
    const checkGroup = (id: number): void => {
      component.userWorkspaceGroups.entries.find(group => group.id === id)!.isChecked = true;
      component.userWorkspaceGroups.updateHasChanged();
    };

    beforeEach(() => {
      groupsOf1 = new Subject<WorkspaceGroupInListDto[] | null>();
      groupsOf2 = new Subject<WorkspaceGroupInListDto[] | null>();
      (mockBackendService.getWorkspaceGroupList as jest.Mock).mockReturnValue(of(groups));
      (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of(users));
      (mockBackendService.getWorkspaceGroupsByAdmin as jest.Mock)
        .mockImplementation((id: number) => (id === 1 ? groupsOf1 : groupsOf2));
      component.createWorkspaceList();
    });

    it('should lock the checks until the groups have arrived', async () => {
      await render();
      selectUser(0);
      fixture.detectChanges();

      expect(checkboxes()).toHaveLength(2);
      expect(checkboxes().every(input => input.disabled)).toBe(true);

      groupsOf1.next([]);
      await render();

      expect(checkboxes().every(input => !input.disabled)).toBe(true);
    });

    it('should not save the checks of the user before onto the one still loading', () => {
      selectUser(0);
      groupsOf1.next([]);
      checkGroup(1);
      selectUser(1);
      fixture.detectChanges();

      expect(saveButton().disabled).toBe(true);

      component.saveWorkspaces();

      expect(mockBackendService.setWorkspaceGroupsByAdmin).not.toHaveBeenCalled();
    });

    it('should drop the late groups of the user selected before', () => {
      selectUser(0);
      selectUser(1);

      groupsOf1.next([groups[0]]);

      expect(component.userWorkspaceGroups.getChecks()).toEqual([]);

      groupsOf2.next([groups[1]]);

      expect(component.userWorkspaceGroups.getChecks()).toEqual([2]);
      expect(mockAppService.dataLoading).toBe(false);
    });

    it('should take the spinner down when the page is left before the groups arrive', () => {
      selectUser(0);

      fixture.destroy();

      expect(mockAppService.dataLoading).toBe(false);
    });

    // Without them the user administered no group, and saving one check replaced the stored ones
    // (#2070).
    it('should keep the checks locked when the groups could not be loaded', async () => {
      const notLoadedHint = (): HTMLElement | null => fixture.nativeElement
        .querySelector('[data-cy="admin-users-groups-not-loaded"]');
      await render();
      selectUser(0);
      groupsOf1.next(null);
      await render();

      expect(notLoadedHint()).not.toBeNull();
      expect(checkboxes()).toHaveLength(0);
      expect(mockAppService.dataLoading).toBe(false);

      checkGroup(1);
      fixture.detectChanges();

      expect(saveButton().disabled).toBe(true);

      component.saveWorkspaces();

      expect(mockBackendService.setWorkspaceGroupsByAdmin).not.toHaveBeenCalled();

      component.tableSelectionRow.clear();
      fixture.detectChanges();

      expect(notLoadedHint()).toBeNull();

      selectUser(1);
      groupsOf2.next([groups[1]]);
      await render();

      expect(notLoadedHint()).toBeNull();
      expect(checkboxes().every(input => !input.disabled)).toBe(true);
    });

    it('should keep an unsaved check when a poll selects the same user again', () => {
      selectUser(0);
      groupsOf1.next([]);
      checkGroup(1);
      (mockBackendService.getUsersFullWithActivity as jest.Mock)
        .mockReturnValue(of(users.map(user => ({ ...user }))));

      component.updateUserList(false, true);

      expect(mockBackendService.getWorkspaceGroupsByAdmin).toHaveBeenCalledTimes(1);
      expect(component.userWorkspaceGroups.getChecks()).toEqual([1]);
      expect(component.userWorkspaceGroups.hasChanged).toBe(true);
      expect(mockSnackBar.open).not.toHaveBeenCalledWith('access-rights.not-saved', 'warning', { duration: 3000 });
    });

    it('should deselect the selected user with one click after a poll', () => {
      selectUser(0);
      groupsOf1.next([]);
      (mockBackendService.getUsersFullWithActivity as jest.Mock)
        .mockReturnValue(of(users.map(user => ({ ...user }))));
      component.updateUserList(false, true);

      component.toggleRowSelection(component.objectsDatasource.data[0]);

      expect(component.tableSelectionRow.selected).toEqual([]);
      expect(component.selectedUser).toBe(0);
    });
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
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.not-saved', 'warning', { duration: 3000 });
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
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.changed', '', { duration: 1000 });
  });

  it('should handle save workspaces failure', () => {
    (mockBackendService.setWorkspaceGroupsByAdmin as jest.Mock).mockReturnValue(of(false));
    component.selectedUser = 123;
    component.userWorkspaceGroups = {
      hasChanged: true,
      getChecks: jest.fn().mockReturnValue([])
    } as unknown as WorkspaceGroupToCheckCollection;
    component.saveWorkspaces();
    expect(mockSnackBar.open).toHaveBeenCalledWith('access-rights.not-changed', 'error', { duration: 3000 });
  });

  it('should calculate session and logged-in counts from activityStatus', () => {
    const users = [
      {
        id: 1,
        name: 'a',
        activityStatus: 'active',
        isLoggedIn: true,
        sessions: [
          { sessionId: 's1', activityStatus: 'active' },
          { sessionId: 's5', activityStatus: 'orphaned' }
        ]
      },
      {
        id: 2,
        name: 'p',
        activityStatus: 'passive',
        isLoggedIn: true,
        sessions: [
          { sessionId: 's2', activityStatus: 'passive' },
          { sessionId: 's3', activityStatus: 'active' }
        ]
      },
      {
        id: 3,
        name: 'i',
        activityStatus: 'inactive',
        isLoggedIn: false,
        sessions: []
      }
    ] as UserFullDto[];

    (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of(users));
    component.updateUserList();

    expect(component.loggedInUserCount).toBe(2);
    expect(component.activeSessionCount).toBe(2);
    expect(component.passiveSessionCount).toBe(1);
    expect(component.orphanedSessionCount).toBe(1);
  });

  it('should not treat logged-in users as logged-out when activityStatus is missing', () => {
    const users = [
      {
        id: 1,
        name: 'u',
        isLoggedIn: true
      },
      {
        id: 2,
        name: 'v',
        isLoggedIn: false
      }
    ] as UserFullDto[];

    (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of(users));
    component.updateUserList();

    expect(component.loggedInUserCount).toBe(1);
    expect(component.activeSessionCount).toBe(0);
  });
  describe('custom sorting logic', () => {
    it('should sort users by lastActivity (activityStatus category weight, then date, then name)', () => {
      const users = [
        {
          id: 1, name: 'Inactive B', activityStatus: 'inactive', lastActivity: undefined
        },
        {
          id: 2, name: 'Active User', activityStatus: 'active', lastActivity: new Date('2026-06-17T12:00:00Z')
        },
        {
          id: 3, name: 'Passive User', activityStatus: 'passive', lastActivity: new Date('2026-06-17T11:00:00Z')
        },
        {
          id: 4, name: 'Inactive A', activityStatus: 'inactive', lastActivity: undefined
        },
        {
          id: 5, name: 'Newer Active', activityStatus: 'active', lastActivity: new Date('2026-06-17T13:00:00Z')
        }
      ] as UserFullDto[];

      (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of(users));
      component.updateUserList(true); // force recreate datasource

      // Sort by lastActivity asc
      const sortedAsc = component.objectsDatasource
        .sortData(users.slice(), { active: 'lastActivity', direction: 'asc' } as MatSort);
      expect(sortedAsc.map(u => u.name)).toEqual([
        'Inactive B',
        'Inactive A',
        'Passive User',
        'Active User',
        'Newer Active'
      ]);

      // Sort by lastActivity desc
      const sortedDesc = component.objectsDatasource
        .sortData(users.slice(), { active: 'lastActivity', direction: 'desc' } as MatSort);
      expect(sortedDesc.map(u => u.name)).toEqual([
        'Newer Active',
        'Active User',
        'Passive User',
        'Inactive B',
        'Inactive A'
      ]);
    });
  });

  // Esc, a click beside the dialog and navigation close it with undefined (#1844)
  describe.each([false, undefined])('when the confirmation closes with %s', result => {
    const user: UserFullDto = {
      id: 4, name: 'user4', sessions: [{ sessionId: 's4', activityStatus: 'orphaned' }]
    };

    it.each<[string, (users: UsersComponent) => void, keyof BackendService]>([
      ['the user', users => users.deleteUsers([user]), 'deleteUsers'],
      ['an orphaned session', users => users.deleteSession(user, user.sessions![0]), 'deleteUserSession'],
      ['all orphaned sessions', users => {
        users.tableSelectionRow.select(user);
        users.deleteOrphanedSessions();
      }, 'deleteUserOrphanedSessions']
    ])('should not delete %s', (_, act, method) => {
      (mockDialog.open as jest.Mock).mockReturnValue({ afterClosed: () => of(result) });

      act(component);

      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockBackendService[method]).not.toHaveBeenCalled();
    });
  });

  it('should show a user who replaced another between two polls', () => {
    (mockBackendService.getUsersFullWithActivity as jest.Mock)
      .mockReturnValue(of([{ id: 1, name: 'anna' }, { id: 2, name: 'bert' }]));
    component.updateUserList();

    (mockBackendService.getUsersFullWithActivity as jest.Mock)
      .mockReturnValue(of([{ id: 1, name: 'anna' }, { id: 3, name: 'carl' }]));
    component.updateUserList(false, true);

    expect(component.objectsDatasource.data.map(user => user.name)).toEqual(['anna', 'carl']);
  });

  it.each<[string, string, string[]]>([
    ['part of the login name in any case', 'ann', ['Anna']],
    ['the last name', 'müll', ['Anna']],
    ['the email, also beside a user without one', 'example.org', ['bert']]
  ])('should find users by %s', (_, filter, names) => {
    (mockBackendService.getUsersFullWithActivity as jest.Mock).mockReturnValue(of([
      { id: 1, name: 'Anna', lastName: 'Müller' },
      { id: 2, name: 'bert', email: 'bert@example.org' }
    ]));
    component.updateUserList();

    component.objectsDatasource.filter = filter;

    expect(component.objectsDatasource.filteredData.map(user => user.name)).toEqual(names);
  });
});
