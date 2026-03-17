import {
  Component, Input
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { of } from 'rxjs';
import {
  WorkspaceGroupFullDto, WorkspaceFullDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { EditWorkspaceSettingsComponent } from './edit-workspace-settings.component';
import { BackendService } from '../../modules/admin/services/backend.service';
import { AppService } from '../../services/app.service';
import { WorkspaceService } from '../../modules/workspace/services/workspace.service';
import { ModuleService } from '../../services/module.service';
import { State } from '../../modules/admin/models/state.type';
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
      states: []
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
            { id: 'profile2/item.json', label: 'Item Profile 1' }
          ]
        }
      } as WorkspaceGroupFullDto)),
      getWorkspaceById: jest.fn().mockReturnValue(of({
        settings: {
          itemMDProfile: 'profile2/item.json',
          unitMDProfile: 'profile1/unit.json'
        }
      } as WorkspaceFullDto))
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize profiles in ngOnInit', () => {
    expect(mockBackendService.getWorkspaceGroupById).toHaveBeenCalledWith(10);
    expect(mockBackendService.getWorkspaceById).toHaveBeenCalledWith(1);
    expect(component.unitMDProfiles.length).toBe(1);
    expect(component.unitMDProfiles[0].id).toBe('profile1/unit.json');
    expect(component.itemMDProfiles.length).toBe(1);
    expect(component.itemMDProfiles[0].id).toBe('profile2/item.json');
    expect(component.selectedItemMDProfile).toBe('profile2/item.json');
    expect(component.selectedUnitMDProfile).toBe('profile1/unit.json');
  });

  it('should update stableModulesOnly in setStableChecked', () => {
    component.setStableChecked({ checked: true } as MatCheckboxChange);
    expect(component.dialogData.stableModulesOnly).toBe(true);
  });

  it('should update modules in selectModule', () => {
    component.selectModule('editor', 'new-editor');
    expect(component.dialogData.defaultEditor).toBe('new-editor');

    component.selectModule('schemer', 'new-schemer');
    expect(component.dialogData.defaultSchemer).toBe('new-schemer');

    component.selectModule('player', 'new-player');
    expect(component.dialogData.defaultPlayer).toBe('new-player');
  });

  it('should update unitMDProfile in selectUnitMDProfile', () => {
    component.selectUnitMDProfile({ value: 'new-unit-profile' } as MatSelectChange);
    expect(component.dialogData.unitMDProfile).toBe('new-unit-profile');
  });

  it('should update itemMDProfile in selectItemMDProfile', () => {
    component.selectItemMDProfile({ value: 'new-item-profile' } as MatSelectChange);
    expect(component.dialogData.itemMDProfile).toBe('new-item-profile');
  });

  it('should sync states in addData', () => {
    const mockStates: State[] = [{ id: 1, label: 'State 1', color: 'red' }];
    component.selectionChanged = mockStates;
    component.addData();
    expect(component.dialogData.states).toBe(mockStates);
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
    it('toggleRouteVisibility should filter out route when adding visibility back (isVisible=true)', () => {
      component.dialogData.hiddenRoutes = ['editor', 'preview'];
      component.toggleRouteVisibility('editor', true);
      expect(component.dialogData.hiddenRoutes).not.toContain('editor');
      expect(component.dialogData.hiddenRoutes).toContain('preview');
    });

    it('toggleRouteVisibility should push route to hiddenRoutes when hiding (isVisible=false)', () => {
      component.dialogData.hiddenRoutes = ['preview'];
      component.toggleRouteVisibility('editor', false);
      expect(component.dialogData.hiddenRoutes).toContain('editor');
      expect(component.dialogData.hiddenRoutes).toContain('preview');
    });
  });
});
