import { Component } from '@angular/core';
import { MainDatastoreService } from '../maindatastore.service';
import {AuthService} from "../auth.service";

@Component({
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css']
})
export class SuperadminComponent {
  navLinks = [
    { path: 'users', label: 'Nutzer:innen' },
    { path: 'workspaces', label: 'Arbeitsbereiche' },
    { path: 'v-modules', label: 'Editoren/Player' },
    { path: 'settings', label: 'Einstellungen' }
  ];

  constructor(
    public authService: AuthService
  ) { }
}
