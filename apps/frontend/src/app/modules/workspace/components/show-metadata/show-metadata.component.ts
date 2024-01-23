import { Component, Inject } from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from '../../services/workspace.service';
import { MetadataService } from '../../../metadata/services/metadata.service';

@Component({
  templateUrl: './show-metadata.component.html',
  styleUrls: ['show-metadata.component.scss']
})

export class ShowMetadataComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[], bookletConfigSettings: BookletConfigDto },
    public workspaceService: WorkspaceService, private metadataService: MetadataService
  ) {
  }

  metadataDisplayFormat: string = 'units';
  xxx: number[] = [];
}
