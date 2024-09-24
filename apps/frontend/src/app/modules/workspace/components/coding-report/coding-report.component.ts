import {
  Component, Inject, OnInit, ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';

import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CodingReportDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'coding-report',
  templateUrl: './coding-report.component.html',
  styleUrls: ['coding-report.component.scss'],
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatRadioButton,
    MatSlideToggle,
    MatFormField,
    MatInput,
    MatLabel
  ]
})

export class CodingReportComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    public backendService: BackendService
  ) {
  }

  displayedColumns: string[] = ['unit', 'variable', 'item', 'validation', 'codingType'];
  dataSource!: MatTableDataSource<CodingReportDto>;
  isLoading = false;
  codedVariablesOnly = true;
  unitDataRows: CodingReportDto[] | never = [];

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.backendService.getCodingReport(this.workspaceService.selectedWorkspaceId)
      .subscribe((codingReport: CodingReportDto[]) => {
        this.unitDataRows = codingReport;
        if (this.codedVariablesOnly) {
          const filteredRows = codingReport
            .filter((row: CodingReportDto) => row.codingType !== 'keine Regeln');
          this.dataSource = new MatTableDataSource(filteredRows);
        } else {
          this.dataSource = new MatTableDataSource(codingReport);
        }
        this.isLoading = false;
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  toggleChange() {
    this.codedVariablesOnly = !this.codedVariablesOnly;
    if (this.codedVariablesOnly) {
      this.dataSource.data = this.unitDataRows
        .filter((row: CodingReportDto) => row.codingType !== 'keine Regeln');
    } else {
      this.dataSource.data = this.unitDataRows;
    }
  }
}
