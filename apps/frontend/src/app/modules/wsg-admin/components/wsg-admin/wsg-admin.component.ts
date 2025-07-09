import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet
} from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-wsg-admin',
  templateUrl: './wsg-admin.component.html',
  styleUrls: ['./wsg-admin.component.scss'],
  imports: [MatTabNav, MatTabLink, RouterLinkActive, RouterLink, MatTabNavPanel, RouterOutlet, TranslateModule]
})
export class WsgAdminComponent implements OnInit {
  navLinks: string[] = ['users', 'workspaces', 'settings'];
  constructor(
    private wsgAdminService: WsgAdminService,
    private backendService: BackendService,
    private appService: AppService,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    const routeKey = 'wsg';
    this.wsgAdminService.selectedWorkspaceGroupId.next(Number(this.route.snapshot.params[routeKey]));
    this.backendService.getWorkspaceGroupData(this.wsgAdminService.selectedWorkspaceGroupId.value)
      .subscribe(wsgData => {
        if (wsgData) {
          this.wsgAdminService.selectedWorkspaceGroupName = wsgData.name ||
          this.translateService.instant('wsg-admin.unknown');
          this.appService.appConfig.setPageTitle(
            this.translateService.instant('wsg-admin.title', {
              name: this.wsgAdminService.selectedWorkspaceGroupName
            })
          );
          this.wsgAdminService.selectedWorkspaceGroupSettings = wsgData.settings || {
            defaultSchemer: '',
            defaultPlayer: '',
            defaultEditor: ''
          };
        } else {
          this.wsgAdminService.selectedWorkspaceGroupName = this.translateService.instant('wsg-admin.error');
          this.wsgAdminService.selectedWorkspaceGroupSettings = {
            defaultSchemer: '',
            defaultPlayer: '',
            defaultEditor: ''
          };
        }
      });
  }
}
