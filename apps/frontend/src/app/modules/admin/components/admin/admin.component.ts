import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';

@Component({
  selector: 'studio-lite-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [MatTabNav, MatTabLink, RouterLinkActive, RouterLink, MatTabNavPanel, RouterOutlet, TranslateModule]
})
export class AdminComponent {
  navLinks = [
    'users',
    'workspace-groups',
    'workspaces',
    'units',
    'v-modules',
    'settings',
    'packages'
  ];
}
