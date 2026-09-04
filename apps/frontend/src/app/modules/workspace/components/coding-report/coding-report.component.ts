import {
  Component,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CodingReportDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../services/workspace.service';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

type CodingReportColumn = Exclude<keyof CodingReportDto, 'validationProblems'> |
'validationDetails';

type CodingReportRow = CodingReportDto & {
  validationDetails: string;
  validationSeverity: 'error' | 'warning' | 'ok';
  unstructuredValidationMessage: string | null;
};

/**
 * The coding report over a workspace: one row per coding variable, with what the validation of the
 * scheme against the unit's variables found. The severity is derived here, so a unit whose scheme
 * cannot be read at all is told apart from one with a warning in it.
 */
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
    MatLabel,
    MatTooltipModule
  ]
})
export class CodingReportComponent implements OnInit {
  private static readonly csvColumns: CodingReportColumn[] = [
    'unit',
    'variable',
    'variableType',
    'item',
    'validation',
    'validationDetails',
    'codingType',
    'trainingEffort'
  ];

  displayedColumns: CodingReportColumn[] = [
    'unit',
    'variable',
    'variableType',
    'item',
    'validationDetails',
    'codingType',
    'trainingEffort'
  ];

  validationDetailColumns = ['expandedValidationDetails'];

  dataSource!: MatTableDataSource<CodingReportRow>; // Datasource for the table
  isLoading = false; // Indicates if data is currently loading
  loadError = false;
  codedVariablesOnly = true; // Filter: Display only coded variables
  unitDataRows: CodingReportRow[] = []; // All rows of data received from the backend
  expandedRow: CodingReportRow | null = null;

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    // Attach table sorting functionality to the data source
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[] },
    public workspaceService: WorkspaceService,
    public backendService: WorkspaceBackendService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadCodingReport();
  }

  /**
   * Fetches the coding report from the backend and initializes the data source.
   */
  loadCodingReport(): void {
    this.isLoading = true;
    this.loadError = false;
    this.backendService.getCodingReport(this.workspaceService.selectedWorkspaceId)
      .subscribe({
        next: (codingReport: CodingReportDto[]) => {
          this.unitDataRows = codingReport.map(row => {
            const validationProblems = row.validationProblems || [];
            const unstructuredValidationMessage = validationProblems.length === 0 &&
              row.validation?.trim() &&
              row.validation.trim().toLowerCase() !== 'ok' ?
              row.validation : null;
            let validationSeverity: CodingReportRow['validationSeverity'] = 'ok';
            if (unstructuredValidationMessage) {
              validationSeverity = 'error';
            } else if (validationProblems.length > 0) {
              validationSeverity = validationProblems.some(problem => problem.breaking) ?
                'error' : 'warning';
            }
            return {
              ...row,
              validationProblems,
              validationDetails: this.formatValidationDetails(row),
              validationSeverity,
              unstructuredValidationMessage
            };
          });
          this.updateDataSource();
        },
        error: () => {
          this.unitDataRows = [];
          this.updateDataSource();
          this.loadError = true;
          this.isLoading = false;
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
      this.unitDataRows.filter((row: CodingReportRow) => row.codingType !== 'keine Regeln') :
      this.unitDataRows;

    this.dataSource = new MatTableDataSource(filteredRows); // Refresh the data source
    const defaultSortingDataAccessor = this.dataSource.sortingDataAccessor;
    const validationSeveritySortOrder: Record<
    CodingReportRow['validationSeverity'], number
    > = {
      error: 0,
      warning: 1,
      ok: 2
    };
    this.dataSource.sortingDataAccessor = (row, column) => (
      column === 'validationDetails' ?
        validationSeveritySortOrder[row.validationSeverity] :
        defaultSortingDataAccessor(row, column)
    );
    this.dataSource.filterPredicate = (row, filter) => (
      CodingReportComponent.csvColumns
        .map(column => String(row[column] ?? ''))
        .join(' ')
        .toLowerCase()
        .includes(filter)
    );
  }

  /**
   * Applies a text filter on the table's data source.
   * @param event The input event triggered by the filter field.
   */
  applyFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement) {
      this.dataSource.filter = inputElement.value.trim().toLowerCase();
    } else {
      // eslint-disable-next-line no-console
      console.warn('Invalid filter input element.');
    }
  }

  /**
   * Toggles the coded variables filter and updates the data source.
   */
  toggleChange(): void {
    this.codedVariablesOnly = !this.codedVariablesOnly;
    this.expandedRow = null;
    this.updateDataSource();
  }

  toggleValidationDetails(row: CodingReportRow): void {
    this.expandedRow = this.expandedRow === row ? null : row;
  }

  isValidationDetailsExpanded(row: CodingReportRow): boolean {
    return this.expandedRow === row;
  }

  downloadCodingReport(): void {
    const rows = this.dataSource?.filteredData || [];
    const headers = CodingReportComponent.csvColumns
      .map(column => this.getCsvHeader(column))
      .join(';');
    const csvRows = rows.map(row => CodingReportComponent.csvColumns
      .map(column => CodingReportComponent.escapeCsvValue(CodingReportComponent.stripHtml(String(
        row[column] ?? ''
      ))))
      .join(';')
    );
    const csvContent = `\uFEFF${[headers, ...csvRows].join('\n')}`;
    const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'kodierbericht.csv';
    link.click();
    URL.revokeObjectURL(fileUrl);
  }

  private static escapeCsvValue(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private static stripHtml(value: string): string {
    let sanitized = value;
    let previous: string;

    do {
      previous = sanitized;
      sanitized = sanitized.replace(/<[^>]+>/g, '');
    } while (sanitized !== previous);

    return sanitized;
  }

  private formatValidationDetails(row: CodingReportDto): string {
    return (row.validationProblems || [])
      .map(problem => {
        const label = this.translateService.instant(
          `coding-report.validation-problems.${problem.type}`
        );
        const codeReference = problem.code ? ` [${this.translateService.instant(
          'coding-report.code-reference',
          { code: problem.code }
        )}]` : '';
        return `${label} (${problem.type})${codeReference}`;
      })
      .join(' | ');
  }

  private getCsvHeader(column: CodingReportColumn): string {
    const translationKey = column === 'validationDetails' ?
      'coding-report.csv-validation-details' :
      `coding-report.${column}`;
    return this.translateService.instant(translationKey);
  }
}
