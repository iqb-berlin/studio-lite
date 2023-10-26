import {
  Component, Inject, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { ModuleService } from '../../services/module.service';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { BackendService } from '../../../admin/services/backend.service';
import { WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';

type Profile = {
  id:string,
  label:string
};

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
    public wsgAdminService: WsgAdminService,
    @Inject(MAT_DIALOG_DATA) public data: { settings: WorkspaceSettingsDto, selectedRow: number }
  ) {
    this.dialogData = this.data.settings as WorkspaceSettingsDto;
  }

  itemMDProfiles:Profile[] = [];
  unitMDProfiles:Profile[] = [];
  selectedItemMDProfile:string = '';
  selectedUnitMDProfile:string = '';
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

  selectUnitMDProfile(e:MatSelectChange) {
    this.dialogData.unitMDProfile = e.value;
  }

  selectItemMDProfile(e:MatSelectChange) {
    this.dialogData.itemMDProfile = e.value;
  }

  ngOnInit(): void {
    this.backendService.getWorkspaceGroupProfiles(this.wsgAdminService.selectedWorkspaceGroupId).subscribe(res => {
      this.unitMDProfiles = res.settings?.profiles
        .filter((profile:Profile) => profile.id.split('/').pop() !== 'item.json') || [];
      this.itemMDProfiles = res.settings?.profiles
        .filter((profile:Profile) => profile.id.split('/').pop() === 'item.json') || [];
    });
    this.backendService.getWorkspaceProfile(this.data.selectedRow).subscribe(res => {
      if (res.settings?.itemMDProfile) this.selectedItemMDProfile = res.settings.itemMDProfile;
      if (res.settings?.unitMDProfile) this.selectedUnitMDProfile = res.settings.unitMDProfile;
    });
  }
}
