import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WsgAdminService } from '../../services/wsg-admin.service';
import { BackendService } from '../../services/backend.service';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-wsg-admin',
  templateUrl: './wsg-admin.component.html',
  styleUrls: ['./wsg-admin.component.scss']
})
export class WsgAdminComponent implements OnInit {
  navLinks: string[] = ['users', 'workspaces'];
  constructor(
    private wsgAdminService: WsgAdminService,
    private backendService: BackendService,
    private appService: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      const routeKey = 'wsg';
      this.wsgAdminService.selectedWorkspaceGroupId = Number(this.route.snapshot.params[routeKey]);
      this.backendService.getWorkspaceGroupData(this.wsgAdminService.selectedWorkspaceGroupId)
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
    });
  }
}
