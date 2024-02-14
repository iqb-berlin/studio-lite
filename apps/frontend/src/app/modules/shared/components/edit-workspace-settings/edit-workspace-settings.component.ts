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
import { State } from '../../../admin/models/state.type';

type Profile = {
  id:string,
  label:string
};

type SelectedRow = {
  id:number,
  groupId:number,
  name:string,
  unitsCount:number,
};

@Component({
  selector: 'studio-lite-edit-workspace-settings',
  templateUrl: './edit-workspace-settings.component.html',
  styleUrls: ['./edit-workspace-settings.component.scss']
})
export class EditWorkspaceSettingsComponent implements OnInit {
  constructor(
    public appService: AppService,
    public backendService: BackendService,
    public workspaceService: WorkspaceService,
    public moduleService: ModuleService,

    @Inject(MAT_DIALOG_DATA) public data: { settings: WorkspaceSettingsDto, selectedRow:SelectedRow }
  ) {
    this.dialogData = { ...this.data.settings as WorkspaceSettingsDto };
  }

  dialogData: WorkspaceSettingsDto;
  selectionChanged!: State[];
  itemMDProfiles:Profile[] = [];
  unitMDProfiles:Profile[] = [];
  selectedItemMDProfile:string = '';
  selectedUnitMDProfile:string = '';
  profiles: Array<string> = [];
  settings = { ...this.workspaceService.workspaceSettings, profile: '' };

  ngOnInit(): void {
    this.selectionChanged = this.dialogData.states as State[];
    const workspaceGroupId = this.data.selectedRow?.groupId || this.workspaceService.groupId;
    if (workspaceGroupId) {
      this.backendService.getWorkspaceGroupProfiles(workspaceGroupId).subscribe(res => {
        this.unitMDProfiles = res.settings.profiles
          ?.filter((profile:Profile) => profile.id.split('/').pop() !== 'item.json') || [];
        this.itemMDProfiles = res.settings.profiles
          ?.filter((profile:Profile) => profile.id.split('/').pop() === 'item.json') || [];
      });
      this.backendService.getWorkspaceProfile(this.data.selectedRow.id).subscribe(res => {
        if (res.settings?.itemMDProfile) this.selectedItemMDProfile = res.settings.itemMDProfile;
        if (res.settings?.unitMDProfile) this.selectedUnitMDProfile = res.settings.unitMDProfile;
      });
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
}
