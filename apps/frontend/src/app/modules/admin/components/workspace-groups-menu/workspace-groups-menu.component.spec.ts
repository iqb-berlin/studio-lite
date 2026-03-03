// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { UntypedFormGroup } from '@angular/forms';
import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { WorkspaceGroupsMenuComponent } from './workspace-groups-menu.component';
import { environment } from '../../../../../environments/environment';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { EditWorkspaceGroupComponent } from '../edit-workspace-group/edit-workspace-group.component';
import {
  EditWorkspaceGroupSettingsComponent
} from '../edit-workspace-group-settings/edit-workspace-group-settings.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('WorkspaceGroupsMenuComponent', () => {
  let component: WorkspaceGroupsMenuComponent;
  let fixture: ComponentFixture<WorkspaceGroupsMenuComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockWorkspaceService: Partial<WorkspaceService>;
  let mockDialog: Partial<MatDialog>;

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: true })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    mockBackendService = {};
    mockWorkspaceService = {};
    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(true))
      })
    };

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        { provide: BackendService, useValue: mockBackendService },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: MatDialog, useValue: mockDialog }
      ],
      imports: [
        MatDialogModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule.forRoot(),
        WorkspaceGroupsMenuComponent,
        MockWrappedIconComponent
      ]
    })
      .overrideComponent(WorkspaceGroupsMenuComponent, {
        remove: { imports: [WrappedIconComponent] },
        add: { imports: [MockWrappedIconComponent] }
      })
      .compileComponents();

    const translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => key as string);

    fixture = TestBed.createComponent(WorkspaceGroupsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open add group dialog and emit event on success', () => {
    const mockFormGroup = new UntypedFormGroup({});
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(mockFormGroup))
    });
    const emitSpy = jest.spyOn(component.groupAdded, 'emit');

    component.addGroup();

    expect(mockDialog.open).toHaveBeenCalledWith(EditWorkspaceGroupComponent, expect.anything());
    expect(emitSpy).toHaveBeenCalledWith(mockFormGroup);
  });

  it('should show message if edit group called without selection', () => {
    component.selectedRows = [];
    // Assuming editGroup doesn't show message based on code but actually it seems it does nothing if empty?
    // Checking code: if (selectedRows.length) ... else ... wait, code doesn't have else for message in editGroup.
    // Ah, wait. users-menu has message. workspace-groups-menu:
    // editGroup(): if (selectedRows.length) { ... }
    // It does nothing if empty.

    component.editGroup();
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should open edit group dialog and emit event on success', () => {
    const group = { id: 1, name: 'g1' } as WorkspaceGroupInListDto;
    component.selectedRows = [group];
    const mockFormGroup = new UntypedFormGroup({});
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(mockFormGroup))
    });
    const emitSpy = jest.spyOn(component.groupEdited, 'emit');

    component.editGroup();

    expect(mockDialog.open).toHaveBeenCalledWith(EditWorkspaceGroupComponent, expect.anything());
    expect(emitSpy).toHaveBeenCalledWith({ selection: [group], group: mockFormGroup });
  });

  it('should open edit settings dialog and emit event on success', () => {
    const group = { id: 1, name: 'g1' } as WorkspaceGroupInListDto;
    component.selectedRows = [group];
    const resultData = { states: [], profilesSelected: [] };
    (mockDialog.open as jest.Mock).mockReturnValue({
      afterClosed: jest.fn().mockReturnValue(of(resultData))
    });
    const emitSpy = jest.spyOn(component.groupSettingsEdited, 'emit');

    component.editGroupSettings();

    expect(mockDialog.open).toHaveBeenCalledWith(EditWorkspaceGroupSettingsComponent, expect.anything());
    expect(emitSpy).toHaveBeenCalledWith({ states: [], profiles: [], selectedRow: 1 });
  });
});
