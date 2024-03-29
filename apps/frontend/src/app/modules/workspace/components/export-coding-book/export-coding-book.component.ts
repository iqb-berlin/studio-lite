import {
  Component, Inject, OnInit
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver-es';
import { DatePipe, NgForOf } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';

const datePipe = new DatePipe('de-DE');

@Component({
  templateUrl: './export-coding-book.component.html',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    MatCheckboxModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    SelectUnitListComponent,
    NgForOf
  ],
  styleUrls: ['export-coding-book.component.scss']
})

export class ExportCodingBookComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    private backendService: BackendService
  ) {
  }

  includeManualCoding = true;
  includeClosedCoding = true;
  exportFormat: 'docx' | 'json' = 'docx';
  missingsProfiles = [''];
  unitList: number[] = [];
  selectedMissingsProfile!:string;

  ngOnInit() {
    this.backendService.getMissingsProfiles(this.workspaceService.selectedWorkspaceId);
  }

  exportCodingBook() {
    this.backendService
      .getCodingBook(this.workspaceService.selectedWorkspaceId,
        this.exportFormat,
        this.includeManualCoding,
        this.includeClosedCoding,
        this.unitList)
      .subscribe(data => {
        if (data) {
          const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
          // eslint-disable-next-line max-len
          saveAs(data, `${thisDate} Kodierbuch ${this.workspaceService.selectedWorkspaceName}${(this.exportFormat === 'json') ? '.json' : '.docx'}`);
        }
      });
  }
}
