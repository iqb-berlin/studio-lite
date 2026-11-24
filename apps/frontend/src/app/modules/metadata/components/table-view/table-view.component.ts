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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MetadataService } from '../../services/metadata.service';
import { IncludePipe } from '../../../../pipes/include.pipe';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { I18nService } from '../../../../services/i18n.service';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';
import { buildXlsxFile } from '../../../../utils/xlsx-file.utils';
import { LanguageService } from '../../../../services/language.service';
import { textIn, valueTextsIn } from '../../../../utils/metadata-language.utils';

type Tab = 'units' | 'items';

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
    private i18nService: I18nService,
    private languageService: LanguageService
  ) {}

  private readonly language = this.languageService.active.code;

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  // Material builds the content of both tabs when the dialog opens: each table has its sorter from the start.
  @ViewChild('unitSort', { static: true }) private unitSort!: MatSort;
  @ViewChild('itemSort', { static: true }) private itemSort!: MatSort;
  viewMode: Tab = 'units';
  workspaceId = this.workspaceService.selectedWorkspaceId;
  /**
   * The rows of each tab, built once when the dialog opens, with the sorter and the filter field of their own
   * table. Built anew on every switch of tabs, they lost the filter, and the item rows answered the sorter of
   * the unit table, the first one `@ViewChild(MatSort)` found (#2184).
   */
  unitRows!: MatTableDataSource<ColumnValues>;
  itemRows!: MatTableDataSource<ColumnValues>;
  /** The columns by id: the fixed ones and the id of each profile field. */
  unitColumns: string[] = [];
  itemColumns: string[] = [];
  /** The name a profile field's column shows, by field id, in the language of the interface (#2207). */
  fieldNames: Record<string, string> = {};
  /** The key of the unit a row belongs to; the row itself holds it as a link, which is no text to sort by. */
  private readonly unitKeys = new WeakMap<ColumnValues, string>();
  displayedColumns: string[] = [
    'key',
    'id',
    'variableId',
    'description'
  ];

  ngOnInit(): void {
    this.unitColumns = this.getTableUnitsColumnsDefinitions();
    this.itemColumns = this.getTableItemsColumnsDefinitions();
    this.unitRows = this.createDataSource(this.getUnitRows(this.data.units), this.unitColumns, this.unitSort);
    this.itemRows = this.createDataSource(this.getItemRows(this.data.units), this.itemColumns, this.itemSort);
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.viewMode = tabChangeEvent.index === 1 ? 'items' : 'units';
  }

  applyFilter(tab: Tab, event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.rowsOf(tab).filter = filterValue.trim().toLowerCase();
  }

  private rowsOf(tab: Tab): MatTableDataSource<ColumnValues> {
    return tab === 'units' ? this.unitRows : this.itemRows;
  }

  private getItemRows(units: UnitPropertiesDto[]): ColumnValues[] {
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
                this.setColumnValues(values, entry),
                item,
                unit,
                i === 0
              );
            });
            totalValues.push(this.withUnitKey(values, unit));
          } else {
            totalValues.push(this.withUnitKey({
              id: item.id || '–',
              variableId: item.variableId,
              description: item.description
            }, unit));
          }
        });
      }
      allUnits.push(totalValues);
    });
    return allUnits.flat();
  }

  private setItemColumnValues(
    values: ColumnValues,
    item: ItemsMetadataValues,
    unit: UnitPropertiesDto,
    addKey: boolean
  ): ColumnValues {
    this.displayedColumns.forEach(column => {
      if (column === 'key' && addKey) {
        this.withUnitKey(values, unit);
      } else {
        values[column] = item[column] ? item[column]?.toString() : '';
      }
    });
    return values;
  }

  // A cell belongs to the column of its field id: a name differs by language and need not be unique.
  private setColumnValues(
    values: ColumnValues,
    entry: MetadataValuesEntry
  ): ColumnValues {
    values[entry.id] = valueTextsIn(entry, this.language)
      .map(text => text.value || '')
      .join('<br>');
    return values;
  }

  private getUnitRows(units: UnitPropertiesDto[]): ColumnValues[] {
    const totalValues: ColumnValues[] = [];
    units.forEach(unit => {
      const activeProfile =
        unit.metadata &&
        unit.metadata.profiles?.find(profile => isCurrentFromOrder(profile.order));
      if (activeProfile) {
        let values: ColumnValues = {};
        if (activeProfile.entries) {
          activeProfile.entries.forEach(entry => {
            values = this.setColumnValues(values, entry);
          });
        }
        totalValues.push(this.withUnitKey(values, unit));
      } else {
        totalValues.push(this.withUnitKey({}, unit));
      }
    });
    return totalValues;
  }

  /**
   * Gives a row the key of its unit: as the link its cell shows, and as plain text beside the row,
   * which is what the column is sorted by.
   */
  private withUnitKey(values: ColumnValues, unit: UnitPropertiesDto): ColumnValues {
    values.key = `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>`;
    this.unitKeys.set(values, unit.key || '');
    return values;
  }

  /** What a cell shows: the key of the unit rather than its link, a line per value rather than `<br>`. */
  private cellText(row: ColumnValues, column: string): string {
    return column === 'key' ? this.unitKeys.get(row) ?? '' : (row[column] ?? '').replace(/<br>/g, '\n');
  }

  /**
   * The table's rows, filtered and sorted by what a cell shows rather than by what it holds:
   *
   * - The key is a link. Sorted by that, its address decided the order, and the rows moved away from
   *   the order by key they are loaded in (#1872). Filtered by that, every unit had "a" in `#/a/`, and
   *   any digit of its workspace or its own id (#2195).
   * - Only the columns of the table are searched: a row can hold values of fields its table does not show.
   * - A profile field can hold numbers, which arrive as text. Where a field holds nothing else, they
   *   are compared as numbers, so that 0.25 stays in front of 0.5. Decided for the column and not
   *   value by value: numbers and text mixed in one comparison give no order at all.
   */
  private static readonly plainNumber = /^\s*-?\d+(\.\d+)?\s*$/;

  private createDataSource(
    rows: ColumnValues[],
    columns: string[],
    sort: MatSort
  ): MatTableDataSource<ColumnValues> {
    const dataSource = new TextSortTableDataSource(rows);
    dataSource.sort = sort;
    dataSource.filterPredicate = (row, filter) => columns
      .map(column => this.cellText(row, column))
      .join(' ')
      .toLowerCase()
      .includes(filter);
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
      if (column === 'key') return this.unitKeys.get(row) ?? '';
      // an empty field among numbers stays empty: as a number it would be 0
      return value && holdsNumbers(column) ? Number(value) : value;
    };
    return dataSource;
  }

  private getTableItemsColumnsDefinitions(): string[] {
    if (!this.metadataService.itemProfileColumns) return [];
    return [...this.displayedColumns, ...this.fieldColumns(this.metadataService.itemProfileColumns.entries ?? [])];
  }

  private getTableUnitsColumnsDefinitions(): string[] {
    if (!this.metadataService.unitProfileColumns) return [];
    return ['key', ...this.fieldColumns(this.metadataService.unitProfileColumns.flatMap(group => group.entries))];
  }

  // The ids of the profile fields as columns, each with its name in the language of the interface.
  private fieldColumns(entries: { id: string; label: { lang: string; value: string }[] }[]): string[] {
    return entries.map(entry => {
      this.fieldNames[entry.id] = textIn(entry.label, this.language);
      return entry.id;
    });
  }

  /**
   * The table as an Excel file: the rows it shows, filtered and sorted as they are, under the headers it
   * shows, in the language of the interface (#2181). The unit is its key rather than the link, and a
   * field with several values gets a line per value.
   */
  async downloadMetadata(): Promise<void> {
    const forUnits = this.viewMode === 'units';
    const table = this.rowsOf(this.viewMode);
    const columns = forUnits ? this.unitColumns : this.itemColumns;
    const rows = table.sort ?
      table.sortData([...table.filteredData], table.sort) :
      table.filteredData;
    const file = await buildXlsxFile(
      this.translateService.instant(forUnits ? 'metadata.units' : 'metadata.items'),
      columns.map(column => ({
        header: this.displayedColumns.includes(column) ?
          this.translateService.instant(`metadata.${column}`) :
          this.fieldNames[column],
        key: column,
        width: 30
      })),
      rows.map(row => Object.fromEntries(columns.map(column => [column, this.cellText(row, column)])))
    );
    const datePipe = new DatePipe(this.i18nService.fullLocale);
    const thisDate = datePipe.transform(new Date(), this.i18nService.fileDateFormat);
    const fileName = this.translateService.instant(
      forUnits ? 'metadata.unitMetadataReportFileName' : 'metadata.itemsMetadataReportFileName',
      { date: thisDate }
    );
    saveAs(file, `${fileName}.xlsx`);
  }
}
