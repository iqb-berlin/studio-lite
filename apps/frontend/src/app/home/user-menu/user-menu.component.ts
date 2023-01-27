import { Component } from '@angular/core';
import { AppService } from '../../app.service';

@Component({
  selector: 'studio-lite-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent {
  constructor(public appService: AppService) { }
}
