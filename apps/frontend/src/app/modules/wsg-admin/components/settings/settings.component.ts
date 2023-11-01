import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { State } from '../../../admin/models/state.type';

type Profile = {
  id: string,
  label: string
};

@Component({
  selector: 'studio-lite-users',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class WorkspaceSettingsComponent implements OnInit {
  settingsChanged: boolean = false;
  settings!: WorkspaceGroupSettingsDto;

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private wsgAdminService:WsgAdminService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.settings = this.wsgAdminService.selectedWorkspaceGroupSettings;
  }

  saveGroupSettings(): void {
    this.backendService.setWorkspaceGroupSettings(
      this.wsgAdminService.selectedWorkspaceGroupId, this.settings)
      .subscribe(
        respOk => {
          if (respOk) {
            this.settingsChanged = false;
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              '',
              { duration: 1000 });
          } else {
            this.settingsChanged = false;
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
          this.appService.dataLoading = false;
        }
      );
  }

  profileSettingsChange(profiles:Profile[]) {
    this.settingsChanged = true;
    this.settings.profiles = profiles;
  }

  stateSettingsChange(states:State[]) {
    this.settingsChanged = true;
    this.settings.states = states;
  }
}
