import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LogoutDirective } from '../../directives/logout.directive';
import { EditMyDataDirective } from '../../directives/edit-my-data.directive';
import { ChangePasswordDirective } from '../../directives/change-password.directive';
import { AccountActionComponent } from '../account-action/account-action.component';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenuTrigger, MatMenu } from '@angular/material/menu';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'studio-lite-user-menu',
    templateUrl: './user-menu.component.html',
    styleUrls: ['./user-menu.component.scss'],
    standalone: true,
    imports: [MatButton, MatMenuTrigger, MatTooltip, WrappedIconComponent, MatMenu, AccountActionComponent, ChangePasswordDirective, EditMyDataDirective, LogoutDirective, TranslateModule]
})
export class UserMenuComponent {}
