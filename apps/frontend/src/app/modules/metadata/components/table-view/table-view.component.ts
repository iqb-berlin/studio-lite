import {
  Component,
  Inject, OnInit, ViewChild
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose, MatDialogTitle
} from '@angular/material/dialog';
import { saveAs } from 'file-saver-es';
import { DatePipe } from '@angular/common';
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import {
  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef,
  MatHeaderRow, MatRowDef, MatRow, MatTableDataSource
} from '@angular/material/table';
import { ItemsMetadataValues, MetadataValuesEntry, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { isCurrentFromOrder } from '@studio-lite/shared-code';
import { MetadataResolver } from '@iqb/metadata-resolver';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MetadataService } from '../../services/metadata.service';
import { IncludePipe } from '../../../../pipes/include.pipe';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { I18nService } from '../../../../services/i18n.service';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';

interface ColumnValues {
  key?: string;
  id?: string;
  variableId?: string | null,
  description?: string,
  [key: string]: string | null | undefined
}

/**
 * The metadata of a workspace's units and items as a table, one column per profile field -- the view
 * that makes gaps visible across many units at once, and the shape the xlsx report is exported in.
 */
@Component({
  selector: 'studio-lite-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  imports: [
    MatSortModule,
    MatDialogContent,
    MatTabGroup,
    MatTab,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    TranslateModule,
    IncludePipe,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    MatSort
  ]
})
export class TableViewComponent implements OnInit {
  constructor(
    private metadataService: MetadataService,
    private workspaceService: WorkspaceService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA)
    public data: { units: UnitPropertiesDto[]; warning: string },
    private i18nService: I18nService
  ) {}

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  viewMode = 'units';
  workspaceId = this.workspaceService.selectedWorkspaceId;
  dataSource!: MatTableDataSource<ColumnValues>;
  displayedColumns: string[] = [
    'key',
    'id',
    'variableId',
    'description'
  ];

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    if (this.dataSource) {
      this.dataSource.sort = sort;
    }
  }

  columnsToDisplay: string[] =
    this.viewMode === 'units' ?
      this.getTableUnitsColumnsDefinitions().slice() :
      this.getTableItemsColumnsDefinitions().slice();

  ngOnInit(): void {
    this.getTableUnitsColumnsDefinitions();
    this.setUnitsDataRows(this.data.units);
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    if (tabChangeEvent.index === 1) {
      this.viewMode = 'items';
      this.columnsToDisplay = this.getTableItemsColumnsDefinitions();
      this.setUnitsItemsDataRows(this.data.units);
    } else {
      this.viewMode = 'units';
      this.columnsToDisplay = this.getTableUnitsColumnsDefinitions();
      this.setUnitsDataRows(this.data.units);
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private setUnitsItemsDataRows(units: UnitPropertiesDto[]): void {
    const allUnits: ColumnValues[][] = [];
    units.forEach(unit => {
      const totalValues: ColumnValues[] = [];
      if (unit.metadata && unit.metadata.items) {
        unit.metadata.items.forEach((item, i: number) => {
          const activeProfile = item.profiles?.find(
            profile => isCurrentFromOrder(profile.order)
          );
          if (activeProfile && activeProfile.entries) {
            let values: ColumnValues = {};
            activeProfile.entries.forEach(entry => {
              values = this.setItemColumnValues(
                TableViewComponent.setColumnValues(values, entry),
                item,
                unit,
                i === 0
              );
            });
            values.key = `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–';
            totalValues.push(values);
          } else {
            totalValues.push({
              key: `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–',
              id: item.id || '–',
              variableId: item.variableId,
              description: item.description
            });
          }
        });
      }
      allUnits.push(totalValues);
    });
    this.dataSource = this.createDataSource(allUnits.flat());
  }

  private setItemColumnValues(
    values: ColumnValues,
    item: ItemsMetadataValues,
    unit: UnitPropertiesDto,
    addKey: boolean
  ): ColumnValues {
    this.displayedColumns.forEach(column => {
      if (column === 'key' && addKey) {
        values.key =
          `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–';
      } else {
        values[column] = item[column] ? item[column]?.toString() : '';
      }
    });
    return values;
  }

  private static setColumnValues(
    values: ColumnValues,
    entry: MetadataValuesEntry
  ): ColumnValues {
    // Key the value under the same resolved label used for the column header
    // (getTableUnitsColumnsDefinitions), otherwise the cell never maps to a column.
    const columnKey = MetadataResolver.extractLabelText(entry.label);
    if (Array.isArray(entry.valueAsText)) {
      if (entry.valueAsText.length > 1) {
        const textValues: string[] = [];
        entry.valueAsText.forEach(textValue => {
          textValues.push(`${textValue.value || ''}`);
        });
        values[columnKey] = textValues.join('<br>');
      } else {
        values[columnKey] = entry.valueAsText[0]?.value || '';
      }
    } else {
      values[columnKey] = entry.valueAsText?.value || '';
    }
    return values;
  }

  private setUnitsDataRows(units: UnitPropertiesDto[]): void {
    const totalValues: ColumnValues[] = [];
    units.forEach(unit => {
      const activeProfile =
        unit.metadata &&
        unit.metadata.profiles?.find(profile => isCurrentFromOrder(profile.order));
      if (activeProfile) {
        let values: ColumnValues = {};
        if (activeProfile.entries) {
          activeProfile.entries.forEach(entry => {
            values = TableViewComponent.setColumnValues(values, entry);
          });
        }
        values.key =
          `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` ||
          '–';
        totalValues.push(values);
      } else {
        totalValues.push({
          key:
            `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–'
        });
      }
    });
    this.dataSource = this.createDataSource(totalValues.flat());
  }

  /**
   * The table's rows, sorted by what a cell shows rather than by what it holds:
   *
   * - The key is a link. Sorted by that, its address decided the order, and the rows moved away from
   *   the order by key they are loaded in (#1872).
   * - A profile field can hold numbers, which arrive as text. Where a field holds nothing else, they
   *   are compared as numbers, so that 0.25 stays in front of 0.5. Decided for the column and not
   *   value by value: numbers and text mixed in one comparison give no order at all.
   */
  private static readonly plainNumber = /^\s*-?\d+(\.\d+)?\s*$/;

  private createDataSource(rows: ColumnValues[]): MatTableDataSource<ColumnValues> {
    const dataSource = new TextSortTableDataSource(rows);
    const numberColumns = new Map<string, boolean>();
    const holdsNumbers = (column: string): boolean => {
      if (!numberColumns.has(column)) {
        numberColumns.set(column, !this.displayedColumns.includes(column) &&
          rows.every(row => !row[column] || TableViewComponent.plainNumber.test(row[column])));
      }
      return !!numberColumns.get(column);
    };
    dataSource.sortingDataAccessor = (row, column) => {
      const value = row[column] ?? '';
      if (column === 'key') return value.replace(/<[^>]*>/g, '');
      // an empty field among numbers stays empty: as a number it would be 0
      return value && holdsNumbers(column) ? Number(value) : value;
    };
    return dataSource;
  }

  private getTableItemsColumnsDefinitions(): string[] {
    if (!this.metadataService.itemProfileColumns) return [];
    const columnsDefinitions: string[] =
      this.metadataService.itemProfileColumns.entries?.map(
        entry => MetadataResolver.extractLabelText(entry.label)
      ) || [];
    return [...this.displayedColumns, ...columnsDefinitions];
  }

  private getTableUnitsColumnsDefinitions(): string[] {
    const columnsDefinitions: string[][] = [];
    if (!this.metadataService.unitProfileColumns) return [];
    this.metadataService.unitProfileColumns.forEach(group => {
      columnsDefinitions.push(group.entries.map(entry => MetadataResolver.extractLabelText(entry.label)));
    });
    return ['key', ...columnsDefinitions.flat()];
  }

  downloadMetadata(): void {
    const datePipe = new DatePipe(this.i18nService.fullLocale);
    const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
    if (this.viewMode === 'units') {
      this.metadataService
        .downloadMetadataReport(
          'unit',
          this.getTableUnitsColumnsDefinitions(),
          this.data.units.map(unit => unit.id)
        )
        .subscribe(b => {
          saveAs(
            b,
            `${this.translateService.instant(
              'metadata.unitMetadataReportFileName',
              { date: thisDate }
            )}.xlsx`
          );
        });
    }
    if (this.viewMode === 'items') {
      this.metadataService
        .downloadMetadataReport(
          'item',
          this.getTableItemsColumnsDefinitions(),
          this.data.units.map(unit => unit.id)
        )
        .subscribe(b => {
          saveAs(
            b,
            `${this.translateService.instant(
              'metadata.itemsMetadataReportFileName',
              { date: thisDate }
            )}.xlsx`
          );
        });
    }
  }
}
