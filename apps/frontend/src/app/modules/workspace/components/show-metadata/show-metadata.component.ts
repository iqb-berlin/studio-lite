import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  templateUrl: './show-metadata.component.html',
  styleUrls: ['show-metadata.component.scss']
})

export class ShowMetadataComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService
  ) {
  }

  unitList: number[] = [];
}
