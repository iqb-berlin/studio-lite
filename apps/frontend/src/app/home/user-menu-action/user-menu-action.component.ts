import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-user-menu-action',
  templateUrl: './user-menu-action.component.html',
  styleUrls: ['./user-menu-action.component.scss']
})
export class UserMenuActionComponent {
  @Input() type!: string;
  @Input() iconName!: string;
}
