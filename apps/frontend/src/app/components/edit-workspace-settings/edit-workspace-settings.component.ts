import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ModuleService } from '@studio-lite/studio-components';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'studio-lite-edit-workspace-settings',
  templateUrl: './edit-workspace-settings.component.html',
  styleUrls: ['./edit-workspace-settings.component.scss']
})
export class EditWorkspaceSettingsComponent {
  dialogData: WorkspaceSettingsDto;

  constructor(
    public appService: AppService,
    public moduleService: ModuleService,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {
    this.dialogData = this.data as WorkspaceSettingsDto;
  }

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
}
