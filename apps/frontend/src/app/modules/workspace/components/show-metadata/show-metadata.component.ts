import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { WorkspaceService } from '../../services/workspace.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';

@Component({
  templateUrl: './show-metadata.component.html',
  styleUrls: ['show-metadata.component.scss'],
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, SelectUnitListComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class ShowMetadataComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService
  ) {
  }

  unitList: number[] = [];
}
