import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';
import { LogoutDirective } from '../../directives/logout.directive';
import { EditMyDataDirective } from '../../directives/edit-my-data.directive';
import { ChangePasswordDirective } from '../../directives/change-password.directive';
import { AccountActionComponent } from '../account-action/account-action.component';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatButton, MatMenuTrigger, MatTooltip, WrappedIconComponent, MatMenu, AccountActionComponent, ChangePasswordDirective, EditMyDataDirective, LogoutDirective, TranslateModule]
})
export class UserMenuComponent {
}
