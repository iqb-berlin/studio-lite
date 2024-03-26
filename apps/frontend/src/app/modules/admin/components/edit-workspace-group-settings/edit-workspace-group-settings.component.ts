import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { WorkspaceGroupSettingsDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { EditWorkspaceGroupComponentData } from '../../models/edit-workspace-group-component-data.type';
import { BackendService } from '../../services/backend.service';
import { State } from '../../models/state.type';
import { WsgAdminService } from '../../../wsg-admin/services/wsg-admin.service';
import { ProfilesComponent } from '../../../shared/components/profiles/profiles.component';
import { Profile } from '../../../shared/models/profile.type';

@Component({
  selector: 'studio-lite-edit-workspace-group',
  templateUrl: './edit-workspace-group-settings.component.html',
  styleUrls: ['./edit-workspace-group-settings.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, ProfilesComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class EditWorkspaceGroupSettingsComponent implements OnInit {
  settings!: WorkspaceGroupSettingsDto;
  profiles: Profile[] = [];
  formData: {
    profilesSelected : Profile[],
    states: State[]
  } = {
      profilesSelected: [],
      states: []
    };

  fetchedProfiles: Profile[] = [];
  constructor(public wsgAdminService: WsgAdminService,
              public backendService: BackendService,
              @Inject(MAT_DIALOG_DATA) public data: EditWorkspaceGroupComponentData) {
  }

  hasChanged(profiles: Profile[]): void {
    this.formData.profilesSelected = profiles;
  }

  async ngOnInit(): Promise<void> {
    this.settings = this.wsgAdminService.selectedWorkspaceGroupSettings;
    this.backendService.getWorkspaceGroupProfiles(this.data.wsg?.id).subscribe(res => {
      this.fetchedProfiles = res.settings?.profiles || [];
      this.formData.profilesSelected = this.fetchedProfiles;
    });
  }
}
