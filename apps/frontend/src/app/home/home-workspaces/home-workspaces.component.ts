import { Component, Input } from '@angular/core';
import { WorkspaceGroupDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-home-workspaces',
  templateUrl: './home-workspaces.component.html',
  styleUrls: ['./home-workspaces.component.scss']
})

export class HomeWorkspacesComponent {
  @Input() workspaceGroups!: WorkspaceGroupDto[];
}
