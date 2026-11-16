import {
  Component, Inject, OnInit, OnDestroy
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {
  State, WorkspaceGroupFullDto, WorkspaceSettingsDto
} from '@studio-lite-lib/api-dto';
import { isItemProfileId } from '@studio-lite/shared-code';
import { MatCheckboxChange, MatCheckbox } from '@angular/material/checkbox';
import { MatSelect } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatLabel, MatError } from '@angular/material/form-field';
import { IncludePipe } from '../../pipes/include.pipe';
import { ModuleService } from '../../services/module.service';
import { AppService } from '../../services/app.service';
import { WorkspaceService } from '../../modules/workspace/services/workspace.service';
import { BackendService } from '../../modules/admin/services/backend.service';
import { SelectModuleComponent } from '../select-module/select-module.component';

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

  imports: [MatDialogTitle, MatDialogContent, MatLabel, SelectModuleComponent, MatCheckbox, MatError, MatSelect, MatOption, MatDialogActions, MatButton, MatDialogClose, TranslateModule, IncludePipe]
})
export class EditWorkspaceSettingsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
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
  profiles: Array<string> = [];
  settings = { ...this.workspaceService.workspaceSettings, profile: '' };

  // The profiles are shown from dialogData, which is what is saved, and not loaded once more: a
  // response that came after a choice put the stored profile back on screen, while the choice was
  // saved (#2138). Both openers pass the workspace's settings in.
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
        }));
    }
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
