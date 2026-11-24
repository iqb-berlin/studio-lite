import {
  Component, Input
} from '@angular/core';
import {
  ComponentFixture, fakeAsync, flush, TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA, MatDialogModule, MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { of } from 'rxjs';
import { WorkspaceGroupFullDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { EditWorkspaceSettingsComponent } from './edit-workspace-settings.component';
import { BackendService } from '../../modules/admin/services/backend.service';
import { AppService } from '../../services/app.service';
import { WorkspaceService } from '../../modules/workspace/services/workspace.service';
import { ModuleService } from '../../services/module.service';
import { SelectModuleComponent } from '../select-module/select-module.component';
import { VeronaModuleClass } from '../../models/verona-module.class';
import { MetadataBackendService } from '../../modules/metadata/services/metadata-backend.service';

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
  let mockMetadataBackendService: Partial<MetadataBackendService>;

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

  // the dialog opened with the given data; synchronous, so a fakeAsync test can open it again
  const createDialog = (data: typeof mockDialogData = mockDialogData) => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
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
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MetadataBackendService, useValue: mockMetadataBackendService }
      ]
    }).overrideComponent(EditWorkspaceSettingsComponent, {
      remove: { imports: [SelectModuleComponent] },
      add: { imports: [MockSelectModuleComponent] }
    });

    fixture = TestBed.createComponent(EditWorkspaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
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
    const de = (value: string) => ({ lang: 'de', value });
    const en = (value: string) => ({ lang: 'en', value });
    mockMetadataBackendService = {
      // the item profile could not be loaded
      getMetadataProfile: jest.fn().mockImplementation((url: string) => of(url === 'profile1/unit.json' ? {
        label: [de('Aufgabe'), en('Unit')],
        groups: [{ label: [], entries: [{ label: [de('Titel'), en('Title')] }] }]
      } : false))
    };

    createDialog();
  });

  it('should initialize profiles in ngOnInit', () => {
    expect(mockBackendService.getWorkspaceGroupById).toHaveBeenCalledWith(10);
    expect(component.unitMDProfiles.map(profile => profile.id)).toEqual(['profile1/unit.json', 'profile3/unit.json']);
    expect(component.itemMDProfiles.map(profile => profile.id)).toEqual(['profile2/item.json']);
  });

  describe('the metadata profiles shown and saved (#2138)', () => {
    // the text of the select, its white space collapsed as the browser shows it
    const shown = (select: 'unit' | 'item') => (fixture.debugElement
      .query(By.css(`[data-cy="edit-workspace-settings-select-${select}-profile"]`))
      .nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim();

    // the stored profiles came with a request of the dialog's own; until it answered, none was shown
    it('shows the stored profiles as soon as the dialog opens', fakeAsync(() => {
      flush();
      fixture.detectChanges();

      expect(shown('unit')).toBe('Unit Profile 1');
      expect(shown('item')).toBe('Item Profile 1');
    }));

    // the select writes into the settings the dialog saves; there is no second value to drift apart
    it('saves the profile it shows', fakeAsync(() => {
      (fixture.debugElement
        .query(By.css('[data-cy="edit-workspace-settings-select-unit-profile"] .mat-mdc-select-trigger'))
        .nativeElement as HTMLElement).click();
      fixture.detectChanges();
      (Array.from(document.querySelectorAll('[data-cy="edit-workspace-settings-unit-profile"]'))
        .find(option => option.textContent?.includes('Unit Profile 2')) as HTMLElement).click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(shown('unit')).toBe('Unit Profile 2');

      (fixture.debugElement.query(By.css('[data-cy="edit-workspace-settings-submit-button"]'))
        .nativeElement as HTMLElement).click();

      expect(mockDialogRef.close).toHaveBeenCalledWith(expect.objectContaining({
        unitMDProfile: 'profile3/unit.json',
        itemMDProfile: 'profile2/item.json'
      }));
    }));

    // a group admin removed the profile from the group: shown, as it is what is saved -- clearing it
    // unasked would reclassify the metadata of every unit on the next save
    it('shows a stored profile the group no longer offers, marked, and saves it unchanged', fakeAsync(() => {
      createDialog({
        ...mockDialogData,
        settings: { ...mockDialogData.settings, unitMDProfile: 'profile9/unit.json' }
      });
      flush();
      fixture.detectChanges();

      expect(shown('unit')).toBe('profile9/unit.json metadata.profile-not-in-group');
      (fixture.debugElement.query(By.css('[data-cy="edit-workspace-settings-submit-button"]'))
        .nativeElement as HTMLElement).click();
      expect(mockDialogRef.close)
        .toHaveBeenCalledWith(expect.objectContaining({ unitMDProfile: 'profile9/unit.json' }));
    }));

    // a click on another profile must not lose it: saving that one would reclassify every unit
    it('keeps a stored profile the group does not list to be chosen again', fakeAsync(() => {
      const choose = (selector: string, text: string) => {
        (fixture.debugElement
          .query(By.css('[data-cy="edit-workspace-settings-select-unit-profile"] .mat-mdc-select-trigger'))
          .nativeElement as HTMLElement).click();
        fixture.detectChanges();
        const option = Array.from(document.querySelectorAll<HTMLElement>(selector))
          .find(element => element.textContent?.includes(text));
        expect(option).toBeDefined();
        option?.click();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();
      };
      createDialog({
        ...mockDialogData,
        settings: { ...mockDialogData.settings, unitMDProfile: 'profile9/unit.json' }
      });
      flush();

      choose('[data-cy="edit-workspace-settings-unit-profile"]', 'Unit Profile 2');
      choose('[data-cy="edit-workspace-settings-unit-profile-not-in-group"]', 'profile9/unit.json');

      expect(shown('unit')).toBe('profile9/unit.json metadata.profile-not-in-group');
      (fixture.debugElement.query(By.css('[data-cy="edit-workspace-settings-submit-button"]'))
        .nativeElement as HTMLElement).click();
      expect(mockDialogRef.close)
        .toHaveBeenCalledWith(expect.objectContaining({ unitMDProfile: 'profile9/unit.json' }));
    }));

    // an undefined key is dropped from the request, and the server keeps the stored profile
    it('removes a profile with the empty option', fakeAsync(() => {
      (fixture.debugElement
        .query(By.css('[data-cy="edit-workspace-settings-select-unit-profile"] .mat-mdc-select-trigger'))
        .nativeElement as HTMLElement).click();
      fixture.detectChanges();
      (document.querySelector('.mat-mdc-select-panel mat-option') as HTMLElement).click();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(shown('unit')).toBe('metadata.select-profile');

      (fixture.debugElement.query(By.css('[data-cy="edit-workspace-settings-submit-button"]'))
        .nativeElement as HTMLElement).click();

      const saved = (mockDialogRef.close as jest.Mock).mock.calls[0][0] as WorkspaceSettingsDto;
      expect(JSON.parse(JSON.stringify(saved))).toEqual(expect.objectContaining({ unitMDProfile: null }));
    }));

    // the same profile in its other spelling (#1570)
    it('shows a stored profile the group lists in its other spelling as that one', fakeAsync(() => {
      mockBackendService.getWorkspaceGroupById = jest.fn().mockReturnValue(of({
        settings: { profiles: [{ id: 'https://w3id.org/iqb/p100/unit', label: 'Unit Profile 100' }] }
      } as WorkspaceGroupFullDto));
      createDialog({
        ...mockDialogData,
        settings: {
          ...mockDialogData.settings,
          unitMDProfile: 'https://raw.githubusercontent.com/iqb-vocabs/p100/master/unit.json'
        }
      });
      flush();
      fixture.detectChanges();

      expect(shown('unit')).toBe('Unit Profile 100');
    }));
  });

  // Read from each profile of the group, so it follows a profile translated after it was chosen (#2212).
  it('reads the languages of every profile of the group from the profile itself', () => {
    expect(mockMetadataBackendService.getMetadataProfile).toHaveBeenCalledWith('profile1/unit.json');
    expect(mockMetadataBackendService.getMetadataProfile).toHaveBeenCalledWith('profile2/item.json');
    // a profile that could not be loaded gets no languages, rather than an empty pair of brackets
    expect(component.profileLanguages()).toEqual({ 'profile1/unit.json': ['de', 'en'] });
  });

  it('should update modules in selectModule', () => {
    component.selectModule('editor', 'new-editor');
    expect(component.dialogData.defaultEditor).toBe('new-editor');

    component.selectModule('schemer', 'new-schemer');
    expect(component.dialogData.defaultSchemer).toBe('new-schemer');

    component.selectModule('player', 'new-player');
    expect(component.dialogData.defaultPlayer).toBe('new-player');
  });

  it('should fall back to workspaceService.groupId if groupId is missing in selectedRow', () => {
    mockWorkspaceService.groupId = 99;

    createDialog({ ...mockDialogData, selectedRow: { ...mockDialogData.selectedRow, groupId: 0 } });

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
