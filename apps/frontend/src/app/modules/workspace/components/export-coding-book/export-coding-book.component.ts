import { Component, forwardRef, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver-es';
import { DatePipe } from '@angular/common';
import { WorkspaceService } from '../../services/workspace.service';
import { SharedModule } from '../../../shared/shared.module';
// eslint-disable-next-line import/no-cycle
import { WorkspaceModule } from '../../workspace.module';
import { BackendService } from '../../services/backend.service';

const datePipe = new DatePipe('de-DE');

@Component({
  templateUrl: './export-coding-book.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    SharedModule,
    forwardRef(() => WorkspaceModule),
    MatCheckboxModule,
    FormsModule
  ],
  styleUrls: ['export-coding-book.component.scss']
})

export class ExportCodingBookComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    private backendService: BackendService
  ) {
  }

  includeManualCoding = false;
  includeClosedCoding = false;
  unitList: number[] = [];

  exportCodingBook() {
    this.backendService
      .getCodingBook(this.workspaceService.selectedWorkspaceId, this.includeManualCoding, this.includeClosedCoding)
      .subscribe(data => {
        if (data) {
          const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
          saveAs(data, `${thisDate} Kodierbuch ${this.workspaceService.selectedWorkspaceName}.docx`);
        }
      });
  }
}