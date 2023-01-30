import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-account-action',
  templateUrl: './account-action.component.html',
  styleUrls: ['./account-action.component.scss']
})
export class AccountActionComponent {
  @Input() type!: string;
  @Input() iconName!: string;
}
