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
import { BackendService } from '../../services/backend.service';

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
    public backendService: BackendService
  ) {}

  ngOnInit(): void {
    this.loadCodingReport();
  }

  /**
   * Fetches the coding report from the backend and initializes the data source.
   */
  private loadCodingReport(): void {
    this.isLoading = true;
    this.backendService.getCodingReport(this.workspaceService.selectedWorkspaceId)
      .subscribe({
        next: (codingReport: CodingReportDto[]) => {
          this.unitDataRows = codingReport;
          this.updateDataSource();
        },
        error: err => {
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

    this.dataSource = new MatTableDataSource(filteredRows); // Refresh the data source
  }

  /**
   * Applies a text filter on the table's data source.
   * @param event The input event triggered by the filter field.
   */
  applyFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement) {
      const filterValue = inputElement.value.trim().toLowerCase();
      this.dataSource.filter = filterValue;
    } else {
      console.warn('Invalid filter input element.');
    }
  }

  /**
   * Toggles the coded variables filter and updates the data source.
   */
  toggleChange(): void {
    this.codedVariablesOnly = !this.codedVariablesOnly;
    this.updateDataSource();
  }
}
