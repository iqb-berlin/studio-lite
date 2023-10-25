import {
  Component, Inject, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ModuleService } from '../../services/module.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { BackendService } from '../../../admin/services/backend.service';

@Component({
  selector: 'studio-lite-edit-workspace-settings',
  templateUrl: './edit-workspace-settings.component.html',
  styleUrls: ['./edit-workspace-settings.component.scss']
})
export class EditWorkspaceSettingsComponent implements OnInit {
  dialogData: WorkspaceSettingsDto;

  constructor(
    public appService: AppService,
    public backendService: BackendService,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,
    @Inject(MAT_DIALOG_DATA) public data: { settings: WorkspaceSettingsDto, selectedRow: number }
  ) {
    this.dialogData = this.data.settings as WorkspaceSettingsDto;
  }

  selected :string = '';
  profiles: Array<string> = [];
  settings = { ...this.workspaceService.workspaceSettings, profile: '' };
  setStableChecked($event: MatCheckboxChange) {
    this.dialogData.stableModulesOnly = $event.checked;
  }

  selectModul(modulType: string, newValue: string) {
    if (modulType === 'editor') {
      this.dialogData.defaultEditor = newValue;
    } else if (modulType === 'schemer') {
      this.dialogData.defaultSchemer = newValue;
    } else if (modulType === 'player') {
      this.dialogData.defaultPlayer = newValue;
    }
  }

  selectProfile(e:any) {
    this.dialogData.profile = e.value;
  }

  ngOnInit(): void {
    this.backendService.getWorkspaceGroupProfiles(this.data.selectedRow).subscribe(res => {
      this.profiles = res.settings.profiles;
    });
    this.backendService.getWorkspaceProfile(this.data.selectedRow).subscribe(res => {
      this.selected = res.settings.profile;
    });
  }
}
