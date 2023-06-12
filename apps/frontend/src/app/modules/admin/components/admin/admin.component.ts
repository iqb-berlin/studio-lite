import { Component } from '@angular/core';

@Component({
  selector: 'studio-lite-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
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
