import {
  Component, Inject, inject, OnInit, OnDestroy, signal
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {
  State, WorkspaceFullDto, WorkspaceGroupFullDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { isItemProfileId } from '@studio-lite/shared-code';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MatSelectChange, MatSelect } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatError } from '@angular/material/form-field';
import { MatTooltip } from '@angular/material/tooltip';
import { IncludePipe } from '../../pipes/include.pipe';
import { ModuleService } from '../../services/module.service';
import { AppService } from '../../services/app.service';
import { WorkspaceService } from '../../modules/workspace/services/workspace.service';
import { BackendService } from '../../modules/admin/services/backend.service';
import { SelectModuleComponent } from '../select-module/select-module.component';
import { MetadataBackendService } from '../../modules/metadata/services/metadata-backend.service';
import { LanguageCodesPipe } from '../../pipes/language-codes.pipe';
import { profileLanguages } from '../../utils/profile-languages.utils';

type Profile = {
  id: string,
  label: string
};

type SelectedRow = {
  id: number,
  groupId: number,
  name: string,
  unitsCount: number,
};

/**
 * The settings dialog of a workspace: the default modules its units are opened with, the metadata
 * profiles they are described under, and which views the workspace offers. What is decided here
 * applies to every unit in it.
 */
@Component({
  selector: 'studio-lite-edit-workspace-settings',
  templateUrl: './edit-workspace-settings.component.html',
  styleUrls: ['./edit-workspace-settings.component.scss'],

  imports: [
    MatDialogTitle, MatDialogContent, MatLabel, SelectModuleComponent, MatCheckbox, MatError, MatSelect, MatOption,
    MatDialogActions, MatButton, MatDialogClose, MatTooltip, TranslateModule, IncludePipe, LanguageCodesPipe
  ]
})
export class EditWorkspaceSettingsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  private readonly metadataBackendService = inject(MetadataBackendService);
  /**
   * The languages each profile of the group is complete in, by its id. Read from the profile itself
   * rather than kept with the group's choice, so it follows a profile that is translated later (#2212).
   */
  private readonly profileLanguagesState = signal<Record<string, string[]>>({});
  readonly profileLanguages = this.profileLanguagesState.asReadonly();
  constructor(
    public appService: AppService,
    public backendService: BackendService,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,

    @Inject(MAT_DIALOG_DATA) public data: { settings: WorkspaceSettingsDto, selectedRow: SelectedRow }
  ) {
    this.dialogData = { ...this.data.settings as WorkspaceSettingsDto };
  }

  dialogData: WorkspaceSettingsDto;
  selectionChanged!: State[];
  itemMDProfiles: Profile[] = [];
  unitMDProfiles: Profile[] = [];
  selectedItemMDProfile: string = '';
  selectedUnitMDProfile: string = '';
  profiles: Array<string> = [];
  settings = { ...this.workspaceService.workspaceSettings, profile: '' };

  ngOnInit(): void {
    this.selectionChanged = this.dialogData.states as State[];
    const workspaceGroupId = this.data.selectedRow?.groupId || this.workspaceService.groupId;
    if (workspaceGroupId) {
      this.backendService.getWorkspaceGroupById(workspaceGroupId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res => {
          this.unitMDProfiles = (
            res && (res as WorkspaceGroupFullDto).settings && (res as WorkspaceGroupFullDto).settings?.profiles
              ?.filter((profile: Profile) => !isItemProfileId(profile.id))
          ) || [];
          this.itemMDProfiles = (
            res && (res as WorkspaceGroupFullDto).settings && (res as WorkspaceGroupFullDto).settings?.profiles
              ?.filter((profile: Profile) => isItemProfileId(profile.id))
          ) || [];
          this.loadProfileLanguages([...this.unitMDProfiles, ...this.itemMDProfiles]);
        }));
      this.backendService.getWorkspaceById(this.data.selectedRow.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          const itemMDProfile = (
            res && (res as WorkspaceFullDto).settings && (res as WorkspaceFullDto).settings?.itemMDProfile
          ) || '';
          if (itemMDProfile) this.selectedItemMDProfile = itemMDProfile;
          const unitMDProfile = (
            res && (res as WorkspaceFullDto).settings && (res as WorkspaceFullDto).settings?.unitMDProfile
          ) || '';
          if (unitMDProfile) this.selectedUnitMDProfile = unitMDProfile;
        });
    }
  }

  private loadProfileLanguages(profiles: Profile[]): void {
    profiles.forEach(profile => {
      this.metadataBackendService.getMetadataProfile(profile.id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(loaded => {
          if (!loaded || loaded === true) return;
          this.profileLanguagesState.update(languages => ({ ...languages, [profile.id]: profileLanguages(loaded) }));
        });
    });
  }

  setStableChecked($event: MatCheckboxChange) {
    this.dialogData.stableModulesOnly = $event.checked;
  }

  selectModule(moduleType: string, newValue: string) {
    if (moduleType === 'editor') {
      this.dialogData.defaultEditor = newValue;
    } else if (moduleType === 'schemer') {
      this.dialogData.defaultSchemer = newValue;
    } else if (moduleType === 'player') {
      this.dialogData.defaultPlayer = newValue;
    }
  }

  selectUnitMDProfile(e:MatSelectChange) {
    this.dialogData.unitMDProfile = e.value;
  }

  selectItemMDProfile(e:MatSelectChange) {
    this.dialogData.itemMDProfile = e.value;
  }

  addData() {
    this.dialogData.states = this.selectionChanged;
    this.selectionChanged = this.dialogData.states as State[];
  }

  toggleRouteVisibility(route: string, isVisible: boolean): void {
    if (!this.dialogData) {
      this.dialogData = {
        defaultEditor: '', defaultPlayer: '', defaultSchemer: '', hiddenRoutes: []
      } as WorkspaceSettingsDto;
    }
    if (!this.dialogData.hiddenRoutes) {
      this.dialogData.hiddenRoutes = [];
    }

    if (isVisible) {
      this.dialogData.hiddenRoutes = this.dialogData.hiddenRoutes.filter((r:string) => r !== route);
    } else if (!this.dialogData.hiddenRoutes.includes(route)) {
      this.dialogData.hiddenRoutes = [...this.dialogData.hiddenRoutes, route];
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
