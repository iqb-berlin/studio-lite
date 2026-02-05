import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NewGroupButtonComponent } from './new-group-button.component';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';

describe('NewGroupButtonComponent', () => {
  let component: NewGroupButtonComponent;
  let fixture: ComponentFixture<NewGroupButtonComponent>;

  const mockDialog = {
    open: jest.fn()
  };

  const mockWorkspaceService = {
    workspaceSettings: {
      unitGroups: [] as string[]
    },
    selectedWorkspaceId: 1
  };

  const mockBackendService = {
    setWorkspaceSettings: jest.fn()
  };

  const mockSnackBar = {
    open: jest.fn()
  };

  const mockTranslateService = {
    instant: jest.fn(key => key),
    get: jest.fn(key => of(key)),
    onLangChange: of({}),
    onTranslationChange: of({}),
    onDefaultLangChange: of({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewGroupButtonComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: AppBackendService, useValue: mockBackendService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewGroupButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockWorkspaceService.workspaceSettings.unitGroups = [];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add new group and save settings when dialog returns string', () => {
    const newGroupName = 'New Group';
    mockDialog.open.mockReturnValue({ afterClosed: () => of(newGroupName) });
    mockBackendService.setWorkspaceSettings.mockReturnValue(of(true));

    const emitSpy = jest.spyOn(component.groupNameChange, 'emit');

    component.newGroup();

    expect(mockWorkspaceService.workspaceSettings.unitGroups).toContain(newGroupName);
    expect(mockBackendService.setWorkspaceSettings).toHaveBeenCalledWith(
      mockWorkspaceService.selectedWorkspaceId,
      mockWorkspaceService.workspaceSettings
    );
    expect(mockSnackBar.open).toHaveBeenCalledWith('workspace.group-saved', '', { duration: 1000 });
    expect(emitSpy).toHaveBeenCalledWith(newGroupName);
  });

  it('should show error snackbar if checking backend returns false', () => {
    const newGroupName = 'New Group 2';
    mockDialog.open.mockReturnValue({ afterClosed: () => of(newGroupName) });
    mockBackendService.setWorkspaceSettings.mockReturnValue(of(false));

    component.newGroup();

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'workspace.group-not-saved',
      'workspace.error',
      { duration: 3000 }
    );
  });

  it('should not add group if it already exists', () => {
    const existingGroup = 'Existing Group';
    mockWorkspaceService.workspaceSettings.unitGroups = [existingGroup];
    mockDialog.open.mockReturnValue({ afterClosed: () => of(existingGroup) });

    component.newGroup();

    expect(mockBackendService.setWorkspaceSettings).not.toHaveBeenCalled();
    expect(mockWorkspaceService.workspaceSettings.unitGroups.length).toBe(1);
  });
});
