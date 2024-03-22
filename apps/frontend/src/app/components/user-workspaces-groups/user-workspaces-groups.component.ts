import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import { NgIf, NgFor } from '@angular/common';
import { WrappedIconComponent } from '../../modules/shared/components/wrapped-icon/wrapped-icon.component';
import { UserIssuesComponent } from '../user-issues/user-issues.component';
import { UserIssuesPipe } from '../../pipes/issues-pipe.pipe';

@Component({
  selector: 'studio-lite-user-workspaces-groups',
  templateUrl: './user-workspaces-groups.component.html',
  styleUrls: ['./user-workspaces-groups.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [NgIf, NgFor, MatAnchor, RouterLink, MatTooltip, WrappedIconComponent, UserIssuesComponent, TranslateModule, UserIssuesPipe]
})

export class UserWorkspacesGroupsComponent {
  @Input() workspaceGroups!: WorkspaceGroupDto[];
}
