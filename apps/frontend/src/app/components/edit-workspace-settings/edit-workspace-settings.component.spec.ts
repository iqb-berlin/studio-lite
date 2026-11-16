import {
  Component, Input
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { of } from 'rxjs';
import {
  WorkspaceGroupFullDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { EditWorkspaceSettingsComponent } from './edit-workspace-settings.component';
import { BackendService } from '../../modules/admin/services/backend.service';
import { AppService } from '../../services/app.service';
import { WorkspaceService } from '../../modules/workspace/services/workspace.service';
import { ModuleService } from '../../services/module.service';
import { SelectModuleComponent } from '../select-module/select-module.component';
import { VeronaModuleClass } from '../../models/verona-module.class';

@Component({
  selector: 'studio-lite-select-module',
  template: '',
  standalone: true
})
class MockSelectModuleComponent {
  @Input() modules: { [key: string]: VeronaModuleClass } = {};
  @Input() hidden: boolean = false;
  @Input() stableOnly: boolean = false;
  @Input() value: string = '';
  @Input() moduleType: string = '';
}

describe('EditWorkspaceSettingsComponent', () => {
  let component: EditWorkspaceSettingsComponent;
  let fixture: ComponentFixture<EditWorkspaceSettingsComponent>;
  let mockBackendService: Partial<BackendService>;
  let mockAppService: Partial<AppService>;
  let mockWorkspaceService: Partial<WorkspaceService>;
  let mockModuleService: Partial<ModuleService>;
  let mockDialogRef: Partial<MatDialogRef<EditWorkspaceSettingsComponent>>;

  const mockDialogData = {
    settings: {
      defaultEditor: 'editor1',
      defaultSchemer: 'schemer1',
      defaultPlayer: 'player1',
      stableModulesOnly: false,
      states: [],
      unitMDProfile: 'profile1/unit.json',
      itemMDProfile: 'profile2/item.json'
    } as WorkspaceSettingsDto,
    selectedRow: {
      id: 1,
      groupId: 10,
      name: 'Workspace 1',
      unitsCount: 5
    }
  };

  beforeEach(async () => {
    mockBackendService = {
      getWorkspaceGroupById: jest.fn().mockReturnValue(of({
        settings: {
          profiles: [
            { id: 'profile1/unit.json', label: 'Unit Profile 1' },
            { id: 'profile2/item.json', label: 'Item Profile 1' },
            { id: 'profile3/unit.json', label: 'Unit Profile 2' }
          ]
        }
      } as WorkspaceGroupFullDto))
    };

    mockAppService = {};
    mockWorkspaceService = {
      workspaceSettings: {} as WorkspaceSettingsDto,
      groupId: 0
    };
    mockModuleService = {};
    mockDialogRef = {
      close: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatDialogModule,
        MatSelectModule,
        TranslateModule.forRoot(),
        EditWorkspaceSettingsComponent
      ],
      providers: [
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: ModuleService, useValue: mockModuleService },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).overrideComponent(EditWorkspaceSettingsComponent, {
      remove: { imports: [SelectModuleComponent] },
      add: { imports: [MockSelectModuleComponent] }
    }).compileComponents();

    fixture = TestBed.createComponent(EditWorkspaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should offer the unit and the item profiles of the group apart', () => {
    expect(mockBackendService.getWorkspaceGroupById).toHaveBeenCalledWith(10);
    expect(component.unitMDProfiles.map(profile => profile.id)).toEqual(['profile1/unit.json', 'profile3/unit.json']);
    expect(component.itemMDProfiles.map(profile => profile.id)).toEqual(['profile2/item.json']);
  });

  // A request of its own put the stored profile back on screen after a choice, while the choice was
  // saved (#2138). What is shown and what is saved are now one value: the settings the dialog was opened with.
  describe('metadata profiles (#2138)', () => {
    const select = (kind: 'unit' | 'item'): MatSelect => fixture.debugElement
      .query(By.css(`[data-cy="edit-workspace-settings-select-${kind}-profile"]`))
      .injector.get(MatSelect);

    it('should show the profiles of the settings it was opened with', () => {
      expect(select('unit').value).toBe('profile1/unit.json');
      expect(select('item').value).toBe('profile2/item.json');
    });

    it('should save the profile it shows once one is chosen', () => {
      select('unit').open();
      fixture.detectChanges();
      select('unit').options.find(option => option.value === 'profile3/unit.json')!.select();
      fixture.detectChanges();

      expect(select('unit').value).toBe('profile3/unit.json');
      expect(component.dialogData.unitMDProfile).toBe('profile3/unit.json');
      expect(component.dialogData.itemMDProfile).toBe('profile2/item.json');
    });
  });

  it('should update modules in selectModule', () => {
    component.selectModule('editor', 'new-editor');
    expect(component.dialogData.defaultEditor).toBe('new-editor');

    component.selectModule('schemer', 'new-schemer');
    expect(component.dialogData.defaultSchemer).toBe('new-schemer');

    component.selectModule('player', 'new-player');
    expect(component.dialogData.defaultPlayer).toBe('new-player');
  });

  it('should fall back to workspaceService.groupId if groupId is missing in selectedRow', async () => {
    TestBed.resetTestingModule();
    const dataWithMissingGroupId = {
      ...mockDialogData,
      selectedRow: { ...mockDialogData.selectedRow, groupId: 0 }
    };
    mockWorkspaceService.groupId = 99;

    await TestBed.configureTestingModule({
      imports: [
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatDialogModule,
        MatSelectModule,
        TranslateModule.forRoot(),
        EditWorkspaceSettingsComponent
      ],
      providers: [
        { provide: BackendService, useValue: mockBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: ModuleService, useValue: mockModuleService },
        { provide: MAT_DIALOG_DATA, useValue: dataWithMissingGroupId },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ]
    }).overrideComponent(EditWorkspaceSettingsComponent, {
      remove: { imports: [SelectModuleComponent] },
      add: { imports: [MockSelectModuleComponent] }
    }).compileComponents();

    fixture = TestBed.createComponent(EditWorkspaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockBackendService.getWorkspaceGroupById).toHaveBeenCalledWith(99);
  });

  describe('Route Visibility Configurations', () => {
    it('toggleRouteVisibility should create a new array reference when adding visibility back (isVisible=true)', () => {
      const initialHiddenRoutes = ['editor', 'preview'];
      component.dialogData.hiddenRoutes = initialHiddenRoutes;
      component.toggleRouteVisibility('editor', true);
      expect(component.dialogData.hiddenRoutes).not.toContain('editor');
      expect(component.dialogData.hiddenRoutes).toContain('preview');
      expect(component.dialogData.hiddenRoutes).not.toBe(initialHiddenRoutes);
    });

    it('should hide a route of a workspace whose settings do not list hidden routes yet', () => {
      expect(component.dialogData.hiddenRoutes).toBeUndefined();

      component.toggleRouteVisibility('comments', false);

      expect(component.dialogData.hiddenRoutes).toEqual(['comments']);
    });

    it('toggleRouteVisibility should create a new array reference when hiding a route (isVisible=false)', () => {
      const initialHiddenRoutes = ['preview'];
      component.dialogData.hiddenRoutes = initialHiddenRoutes;
      component.toggleRouteVisibility('editor', false);
      expect(component.dialogData.hiddenRoutes).toContain('editor');
      expect(component.dialogData.hiddenRoutes).toContain('preview');
      expect(component.dialogData.hiddenRoutes).not.toBe(initialHiddenRoutes);
    });
  });
});
