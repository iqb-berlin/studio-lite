import { Component } from '@angular/core';
import { MainDatastoreService } from '../maindatastore.service';

@Component({
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css']
})
export class SuperadminComponent {
  isSuperadmin = false;
  navLinks = [
    { path: 'users', label: 'Nutzer' },
    { path: 'workspaces', label: 'Arbeitsbereiche' },
    { path: 'v-modules', label: 'Editoren/Player' },
    { path: 'settings', label: 'Einstellungen' }
  ];

  constructor(
    public mds: MainDatastoreService
  ) { }
}
