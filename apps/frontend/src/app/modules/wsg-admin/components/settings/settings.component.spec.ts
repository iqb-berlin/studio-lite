/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  Component, Input, Output, EventEmitter
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import {
  UnitRichNoteTagDto,
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { BehaviorSubject, of } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { State } from '../../../admin/models/state.type';
import { CoreProfile, ProfilesComponent } from '../../../../components/profiles/profiles.component';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { StatesComponent } from '../states/states.component';
import {
  UnitRichNoteTagsConfigComponent
} from '../unit-rich-note-tags-config/unit-rich-note-tags-config.component';
import { WorkspaceSettingsComponent } from './settings.component';

@Component({
  selector: 'studio-lite-unit-rich-note-tags-config',
  template: '',
  standalone: true
})
class MockUnitRichNoteTagsConfigComponent {
  @Input() globalTagsJson = '';
  @Output() hasChanged = new EventEmitter<UnitRichNoteTagDto[]>();
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
    settingsChanged: boolean;
  };
  let mockSnackBar: { open: jest.Mock };
  let mockMatDialogRef: { close: jest.Mock; afterClosed: jest.Mock };

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
      settingsChanged: false
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize settings from service', () => {
    expect(component.settings).toEqual(mockWsgAdminService.selectedWorkspaceGroupSettings.value);
  });

  it('should save group settings successfully', () => {
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(of(true));
    component.saveGroupSettings();
    expect(mockWsgAdminService.setWorkspaceGroupSettings).toHaveBeenCalledWith(1, component.settings);
    expect(mockWsgAdminService.settingsChanged).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-settings.changed', '', { duration: 1000 });
  });

  it('should handle save error', () => {
    mockWsgAdminService.setWorkspaceGroupSettings.mockReturnValue(of(false));
    component.saveGroupSettings();
    expect(mockWsgAdminService.settingsChanged).toBe(true);
    expect(mockSnackBar.open).toHaveBeenCalledWith('wsg-settings.changed', 'error', { duration: 3000 });
  });

  it('should update profiles settings', () => {
    const newProfiles = [{ id: 'p1', label: 'Profile 1' }] as unknown as CoreProfile[];
    component.profileSettingsChange(newProfiles);
    expect(component.settings.profiles).toEqual(newProfiles);
    expect(mockWsgAdminService.settingsChanged).toBe(true);
  });

  it('should update states settings', () => {
    const newStates: State[] = [{ id: 1, label: 'State 1', color: '#ffffff' }];
    component.stateSettingsChange(newStates);
    expect(component.settings.states).toEqual(newStates);
    expect(mockWsgAdminService.settingsChanged).toBe(true);
  });
});
