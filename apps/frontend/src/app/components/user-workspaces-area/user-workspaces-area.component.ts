import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { UserWorkspacesGroupsComponent } from '../user-workspaces-groups/user-workspaces-groups.component';
import { WarningComponent } from '../warning/warning.component';
import { AreaTitleComponent } from '../area-title/area-title.component';

@Component({
  selector: 'studio-lite-user-workspaces-area',
  templateUrl: './user-workspaces-area.component.html',
  styleUrls: ['./user-workspaces-area.component.scss'],
  // eslint-disable-next-line max-len
  imports: [AreaTitleComponent, WarningComponent, UserWorkspacesGroupsComponent, TranslateModule]
})
export class UserWorkspacesAreaComponent {
  @Input() workspaceGroups!: WorkspaceGroupDto[];
  @Input() warning!: string;
  @Input() isAdmin!: boolean;
}
