import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [MatTabNav, MatTabLink, RouterLinkActive, RouterLink, MatTabNavPanel, RouterOutlet, TranslateModule]
})
export class AdminComponent implements OnInit {
  navLinks = [
    'users',
    'workspace-groups',
    'workspaces',
    'units',
    'unit-items',
    'v-modules',
    'widgets',
    'settings',
    'packages'
  ];

  constructor(
    private appService: AppService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.appConfig
        .setPageTitle(this.translateService.instant('home.admin'));
    });
  }
}
