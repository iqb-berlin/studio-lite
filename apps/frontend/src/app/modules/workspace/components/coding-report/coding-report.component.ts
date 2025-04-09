import {
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { CodingReportDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

@Component({
  selector: 'studio-lite-coding-report',
  templateUrl: './coding-report.component.html',
  styleUrls: ['./coding-report.component.scss'],
  imports: [
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSlideToggle,
    MatFormField,
    MatInput,
    MatLabel
  ]
})
export class CodingReportComponent implements OnInit {
  // Columns to display in the table
  displayedColumns: string[] = ['unit', 'variable', 'item', 'validation', 'codingType'];
  dataSource!: MatTableDataSource<CodingReportDto>; // Datasource for the table
  isLoading = false; // Indicates if data is currently loading
  codedVariablesOnly = true; // Filter: Display only coded variables
  unitDataRows: CodingReportDto[] = []; // All rows of data received from the backend

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    // Attach table sorting functionality to the data source
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    public backendService: WorkspaceBackendService
  ) {}

  ngOnInit(): void {
    this.loadCodingReport();
  }

  private loadCodingReport(): void {
    this.isLoading = true;
    this.backendService.getCodingReport(this.workspaceService.selectedWorkspaceId)
      .subscribe({
        next: (codingReport: CodingReportDto[]) => {
          this.unitDataRows = codingReport;
          this.updateDataSource();
        },
        error: err => {
          // eslint-disable-next-line no-console
          console.error('Error loading the coding report:', err);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  /**
   * Updates the data source based on the `codedVariablesOnly` setting.
   * This is triggered when data is loaded or the filter changes.
   */
  private updateDataSource(): void {
    const filteredRows = this.codedVariablesOnly ?
      this.unitDataRows.filter((row: CodingReportDto) => row.codingType !== 'keine Regeln') :
      this.unitDataRows;

    this.markDuplicateVariables();

    this.dataSource = new MatTableDataSource(filteredRows);
  }

  applyFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement) {
      this.dataSource.filter = inputElement.value.trim().toLowerCase();
    } else {
      // eslint-disable-next-line no-console
      console.warn('Invalid filter input element.');
    }
  }

  private markDuplicateVariables(): void {
    const variableMap: Record<number, Set<string>> = {};
    const duplicates: Set<number> = new Set();

    this.unitDataRows.forEach((row, index) => {
      if (row.unit) {
        const unitKey = row.unit as unknown as number;

        if (!variableMap[unitKey]) {
          variableMap[unitKey] = new Set();
        }

        if (variableMap[unitKey].has(row.variable)) {
          duplicates.add(index);
        } else {
          variableMap[unitKey].add(row.variable);
        }
      }
    });

    this.unitDataRows = this.unitDataRows
      .map((row, index) => ({
        ...row,
        isDuplicate: duplicates.has(index)
      }));
  }

  toggleChange(): void {
    this.codedVariablesOnly = !this.codedVariablesOnly;
    this.updateDataSource();
  }
}
