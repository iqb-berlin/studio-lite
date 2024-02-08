import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  WorkspaceGroupSettingsDto
} from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { State } from '../../../admin/models/state.type';
import { CoreProfile } from '../../../shared/components/profiles/profiles.component';

@Component({
  selector: 'studio-lite-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class WorkspaceSettingsComponent implements OnInit {
  settings!: WorkspaceGroupSettingsDto;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public wsgAdminService:WsgAdminService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.settings = this.wsgAdminService.selectedWorkspaceGroupSettings;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async saveGroupSettings() {
    this.wsgAdminService.setWorkspaceGroupSettings(
      this.wsgAdminService.selectedWorkspaceGroupId, this.settings)
      .pipe(
        takeUntil(this.ngUnsubscribe))
      .subscribe(
        respOk => {
          if (respOk) {
            this.wsgAdminService.settingsChanged = false;
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              '',
              { duration: 1000 });
          } else {
            this.wsgAdminService.settingsChanged = true;
            this.snackBar.open(
              this.translateService.instant('wsg-settings.changed'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
        }
      );
  }

  profileSettingsChange(profiles:CoreProfile[]) {
    this.wsgAdminService.settingsChanged = true;
    this.settings.profiles = profiles;
  }

  stateSettingsChange(states:State[]) {
    this.wsgAdminService.settingsChanged = true;
    this.settings.states = states;
  }
}
