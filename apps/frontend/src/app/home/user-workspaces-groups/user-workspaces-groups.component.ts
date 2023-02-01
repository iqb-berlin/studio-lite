import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-user-workspaces-groups',
  templateUrl: './user-workspaces-groups.component.html',
  styleUrls: ['./user-workspaces-groups.component.scss']
})

export class UserWorkspacesGroupsComponent {
  @Input() workspaceGroups!: WorkspaceGroupDto[];
}
