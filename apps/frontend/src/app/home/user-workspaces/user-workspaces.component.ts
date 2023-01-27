import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-user-workspaces',
  templateUrl: './user-workspaces.component.html',
  styleUrls: ['./user-workspaces.component.scss']
})

export class UserWorkspacesComponent {
  @Input() workspaceGroups!: WorkspaceGroupDto[];
}
