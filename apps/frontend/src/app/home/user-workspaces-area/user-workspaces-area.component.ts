import { Component } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'studio-lite-user-workspaces-area',
  templateUrl: './user-workspaces-area.component.html',
  styleUrls: ['./user-workspaces-area.component.scss']
})
export class UserWorkspacesAreaComponent {
  constructor(public appService: AppService) {}
}
