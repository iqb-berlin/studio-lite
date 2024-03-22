import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';

@Component({
    selector: 'studio-lite-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
    standalone: true,
    imports: [MatTabNav, NgFor, MatTabLink, RouterLinkActive, RouterLink, MatTabNavPanel, RouterOutlet, TranslateModule]
})
export class AdminComponent {
  navLinks = [
    'users',
    'workspaces',
    'v-modules',
    'settings',
    'packages'
  ];
}
