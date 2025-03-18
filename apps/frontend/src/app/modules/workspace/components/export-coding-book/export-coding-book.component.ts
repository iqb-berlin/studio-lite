import {
  Component, OnInit
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { saveAs } from 'file-saver-es';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { CodeBookContentSetting } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';
import { SelectUnitComponent } from '../select-unit/select-unit.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { AppService } from '../../../../services/app.service';

const datePipe = new DatePipe('de-DE');

@Component({
    templateUrl: './export-coding-book.component.html',
    imports: [
        TranslateModule,
        MatDialogModule,
        MatCheckboxModule,
        FormsModule,
        MatRadioModule,
        MatSelectModule,
        MatButton,
        SelectUnitComponent,
        SelectUnitListComponent,
        JsonPipe
    ],
    styleUrls: ['export-coding-book.component.scss']
})

export class ExportCodingBookComponent implements OnInit {
  constructor(
    // @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    private backendService: BackendService,
    private appService: AppService
  ) {
  }

  unitList: number[] = [];
  selectedMissingsProfile:string = '';
  missingsProfiles:string[] = [''];
  workspaceChanges = this.workspaceService.isChanged();

  ngOnInit() {
    this.backendService.getMissingsProfiles().subscribe(missingsProfiles => {
      if (missingsProfiles.length > 0) {
        this.missingsProfiles = missingsProfiles.map(mp => mp.label);
      }
    });
  }

  contentOptions:CodeBookContentSetting = {
    exportFormat: 'docx',
    missingsProfile: '',
    hasOnlyManualCoding: true,
    hasGeneralInstructions: true,
    hasDerivedVars: true,
    hasOnlyVarsWithCodes: true,
    hasClosedVars: true,
    codeLabelToUpper: true,
    showScore: true,
    hideItemVarRelation: true
  };

  exportCodingBook() {
    this.appService.dataLoading = true;
    this.backendService
      .getCodingBook(
        this.workspaceService.selectedWorkspaceId,
        this.selectedMissingsProfile,
        this.contentOptions,
        this.unitList)
      .subscribe(data => {
        if (data) {
          const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
          // eslint-disable-next-line max-len
          saveAs(data, `${thisDate} Codebook ${this.workspaceService.selectedWorkspaceName}${(this.contentOptions.exportFormat === 'json') ? '.json' : '.docx'}`);
          this.appService.dataLoading = false;
        }
      });
  }
}
