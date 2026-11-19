/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Output, EventEmitter, WritableSignal, signal
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import {
  State, WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CoreProfile, ProfilesComponent } from '../../../../components/profiles/profiles.component';
import { SettingsLoad, WsgAdminService } from '../../services/wsg-admin.service';
import { StatesComponent } from '../states/states.component';
import {
  UnitRichNoteTagsConfigComponent
} from '../../../admin/components/unit-rich-note-tags-config/unit-rich-note-tags-config.component';
import { WorkspaceSettingsComponent } from './settings.component';

@Component({
  selector: 'studio-lite-unit-rich-note-tags-config',
  template: '',
  standalone: true
})
class MockUnitRichNoteTagsConfigComponent {
  @Input() config: string[] | null = null;
  @Input() showSaveButton = true;
  @Output() configChange = new EventEmitter<string[]>();
}

@Component({
  selector: 'studio-lite-profiles',
  template: '',
  standalone: true
})
class MockProfilesComponent {
  @Input() profiles: CoreProfile[] = [];
  @Output() profilesChange = new EventEmitter<CoreProfile[]>();
}

@Component({
  selector: 'studio-lite-states',
  template: '',
  standalone: true
})
class MockStatesComponent {
  @Input() states: State[] = [];
  @Output() statesChange = new EventEmitter<State[]>();
}

describe('WorkspaceSettingsComponent', () => {
  let component: WorkspaceSettingsComponent;
  let fixture: ComponentFixture<WorkspaceSettingsComponent>;
  let mockWsgAdminService: {
    selectedWorkspaceGroupSettings: BehaviorSubject<WorkspaceGroupSettingsDto>;
    selectedWorkspaceGroupId: BehaviorSubject<number>;
    setWorkspaceGroupSettings: jest.Mock;
    settingsLoad: WritableSignal<SettingsLoad>;
  };
  let mockSnackBar: { open: jest.Mock };
  let mockMatDialogRef: { close: jest.Mock; afterClosed: jest.Mock };
  const saveButtonOf = (page: ComponentFixture<WorkspaceSettingsComponent>): HTMLButtonElement => (
    page.nativeElement as HTMLElement
  ).querySelector('[data-cy="wsg-admin-settings-save-button"]') as HTMLButtonElement;

  beforeEach(async () => {
    mockWsgAdminService = {
      selectedWorkspaceGroupSettings: new BehaviorSubject<WorkspaceGroupSettingsDto>({
        profiles: [],
        states: [],
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: ''
      }),
      selectedWorkspaceGroupId: new BehaviorSubject<number>(1),
      setWorkspaceGroupSettings: jest.fn().mockReturnValue(of(true)),
      settingsLoad: signal<SettingsLoad>('loaded')
    };

    mockSnackBar = {
      open: jest.fn()
    };

    mockMatDialogRef = {
      close: jest.fn(),
      afterClosed: jest.fn().mockReturnValue(of(true))
    };

    await TestBed.configureTestingModule({
      imports: [WorkspaceSettingsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: WsgAdminService, useValue: mockWsgAdminService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: 'SERVER_URL', useValue: 'http://test-url.com' },
        { provide: MatDialogRef, useValue: mockMatDialogRef }
      ]
    })
      .overrideComponent(WorkspaceSettingsComponent, {
        remove: {
          imports: [ProfilesComponent, StatesComponent, UnitRichNoteTagsConfigComponent]
        },
        add: {
          imports: [MockProfilesComponent, MockStatesComponent, MockUnitRichNoteTagsConfigComponent]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkspaceSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should save group settings successfully', async () => {
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(of(true));
    await component.saveGroupSettings();
    expect(mockWsgAdminService.setWorkspaceGroupSettings).toHaveBeenCalledWith(1, component.settings);
    expect(component.settingsChanged()).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-settings.changed', '', { duration: 1000 });
  });

  // #2094: what is entered while the save is under way was not sent
  it('keeps an entry made while saving unsaved', async () => {
    const answer = new Subject<boolean>();
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(answer);
    component.richNoteTagsSettingsChange(['http://gesendet']);
    const saving = component.saveGroupSettings();
    component.richNoteTagsSettingsChange(['http://danach']);
    answer.next(true);
    await saving;

    expect(mockWsgAdminService.setWorkspaceGroupSettings).toHaveBeenCalledTimes(1);
    expect(mockWsgAdminService.setWorkspaceGroupSettings.mock.calls[0][1].richNoteTags).toEqual(['http://gesendet']);
    expect(component.settingsChanged()).toBe(true);
    expect(component.settings.richNoteTags).toEqual(['http://danach']);
  });

  // Leaving the page discards what is not saved, but the page opened again offered it to save (#2163).
  it('offers nothing to save on the page opened again after it was left unsaved', () => {
    component.richNoteTagsSettingsChange(['http://ungespeichert']);
    fixture.detectChanges();
    expect(saveButtonOf(fixture).disabled).toBe(false);
    fixture.destroy();

    const reopened = TestBed.createComponent(WorkspaceSettingsComponent);
    reopened.detectChanges();

    expect(reopened.componentInstance.settings.richNoteTags).toBeUndefined();
    expect(saveButtonOf(reopened).disabled).toBe(true);
  });

  // An entry made while saving came back as saved on the page opened again (#2163).
  it('shows what was saved on the page opened again, not an entry made while saving', async () => {
    const answer = new Subject<boolean>();
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(answer);
    component.richNoteTagsSettingsChange(['http://gesendet']);
    const saving = component.saveGroupSettings();
    component.richNoteTagsSettingsChange(['http://danach']);
    answer.next(true);
    await saving;
    fixture.destroy();

    const reopened = TestBed.createComponent(WorkspaceSettingsComponent);
    reopened.detectChanges();

    expect(reopened.componentInstance.settings.richNoteTags).toEqual(['http://gesendet']);
    expect(saveButtonOf(reopened).disabled).toBe(true);
  });

  // Leaving the page cancelled a save under way, which the API may have stored all the same, and the page opened
  // again showed the settings from before it (#2163).
  it('shows what was saved on the page opened again when it was left while saving', async () => {
    const answer = new Subject<boolean>();
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(answer);
    component.richNoteTagsSettingsChange(['http://gesendet']);
    const saving = component.saveGroupSettings();
    fixture.destroy();
    answer.next(true);
    await saving;

    const reopened = TestBed.createComponent(WorkspaceSettingsComponent);
    reopened.detectChanges();

    expect(reopened.componentInstance.settings.richNoteTags).toEqual(['http://gesendet']);
    expect(saveButtonOf(reopened).disabled).toBe(true);
  });

  it('publishes a save answered after the page was left only into the same group', async () => {
    const answer = new Subject<boolean>();
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(answer);
    component.richNoteTagsSettingsChange(['http://gruppe-1']);
    const saving = component.saveGroupSettings();
    fixture.destroy();
    const otherGroup = {
      ...mockWsgAdminService.selectedWorkspaceGroupSettings.value,
      richNoteTags: ['http://gruppe-2']
    };
    mockWsgAdminService.selectedWorkspaceGroupId.next(2);
    mockWsgAdminService.selectedWorkspaceGroupSettings.next(otherGroup);
    answer.next(true);
    await saving;

    expect(mockWsgAdminService.selectedWorkspaceGroupSettings.value).toBe(otherGroup);
  });

  it('should handle save error', async () => {
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(of(false));
    await component.saveGroupSettings();
    expect(component.settingsChanged()).toBe(true);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-settings.changed', 'error', { duration: 3000 });
  });

  it('should update profiles settings', () => {
    const newProfiles = [{ id: 'p1', label: 'Profile 1' }] as unknown as CoreProfile[];
    component.profileSettingsChange(newProfiles);
    expect(component.settings.profiles).toEqual(newProfiles);
    expect(component.settingsChanged()).toBe(true);
  });

  it('should update states settings', () => {
    const newStates: State[] = [{ id: 1, label: 'State 1', color: '#ffffff' }];
    component.stateSettingsChange(newStates);
    expect(component.settings.states).toEqual(newStates);
    expect(component.settingsChanged()).toBe(true);
  });

  // Units keep the id of a deleted state, so it stays given out (#2009).
  it('should keep the id of a deleted state as given out', () => {
    mockWsgAdminService.selectedWorkspaceGroupSettings.next({
      ...mockWsgAdminService.selectedWorkspaceGroupSettings.value,
      states: [{ id: 1, label: 'State 1', color: '#ffffff' }, { id: 2, label: 'State 2', color: '#ffffff' }]
    });

    component.stateSettingsChange([{ id: 1, label: 'State 1', color: '#ffffff' }]);

    expect(component.settings.lastStateId).toBe(2);
  });

  // Saving settings that were not loaded would lay substitutes over the stored ones (#2010).
  it('should say that the settings were not loaded and offer nothing to save', () => {
    mockWsgAdminService.settingsLoad.set('failed');
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-cy="wsg-admin-settings-not-loaded"]')).not.toBeNull();
    expect(element.querySelector('[data-cy="wsg-admin-settings-save-button"]')).toBeNull();
  });

  it('should offer the settings to save once they are loaded', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[data-cy="wsg-admin-settings-not-loaded"]')).toBeNull();
    expect(element.querySelector('[data-cy="wsg-admin-settings-save-button"]')).not.toBeNull();
  });
});

// The real states component: what deleting a state does reaches this page only through its outputs.
describe('WorkspaceSettingsComponent with the states', () => {
  let fixture: ComponentFixture<WorkspaceSettingsComponent>;
  let setWorkspaceGroupSettings: jest.Mock;

  beforeEach(async () => {
    setWorkspaceGroupSettings = jest.fn().mockReturnValue(of(true));
    const wsgAdminService = {
      selectedWorkspaceGroupSettings: new BehaviorSubject<WorkspaceGroupSettingsDto>({
        profiles: [],
        states: [{ id: 1, label: 'State 1', color: '#ffffff' }],
        defaultEditor: '',
        defaultPlayer: '',
        defaultSchemer: ''
      }),
      selectedWorkspaceGroupId: new BehaviorSubject<number>(1),
      setWorkspaceGroupSettings,
      settingsLoad: signal<SettingsLoad>('loaded')
    };

    await TestBed.configureTestingModule({
      imports: [WorkspaceSettingsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: WsgAdminService, useValue: wsgAdminService },
        { provide: MatSnackBar, useValue: { open: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) } }
      ]
    })
      .overrideComponent(WorkspaceSettingsComponent, {
        remove: { imports: [ProfilesComponent, UnitRichNoteTagsConfigComponent] },
        add: { imports: [MockProfilesComponent, MockUnitRichNoteTagsConfigComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkspaceSettingsComponent);
    fixture.detectChanges();
  });

  // Deleting a state sent all settings of the page, unsaved profiles as well (#2141).
  it('should send nothing when a state is deleted, and offer the deletion to save', () => {
    const element: HTMLElement = fixture.nativeElement;
    const saveButton = element.querySelector('[data-cy="wsg-admin-settings-save-button"]') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(true);

    (element.querySelector('.delete-button') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(setWorkspaceGroupSettings).not.toHaveBeenCalled();
    expect(fixture.componentInstance.settings.states).toEqual([]);
    expect(saveButton.disabled).toBe(false);
  });
});
