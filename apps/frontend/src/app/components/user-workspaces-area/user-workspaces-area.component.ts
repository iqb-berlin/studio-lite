import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-user-workspaces-area',
  templateUrl: './user-workspaces-area.component.html',
  styleUrls: ['./user-workspaces-area.component.scss']
})
export class UserWorkspacesAreaComponent {
  @Input() workspaceGroups!: WorkspaceGroupDto[];
  @Input() warning!: string;
  @Input() isAdmin!: boolean;
}
