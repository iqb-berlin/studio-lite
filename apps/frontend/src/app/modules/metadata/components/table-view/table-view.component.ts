import {
  Component,
  Inject, OnInit, ViewChild
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { saveAs } from 'file-saver-es';
import { DatePipe } from '@angular/common';
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import {
  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef,
  MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { ItemsMetadataValues, MetadataValuesEntry, UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { MetadataService } from '../../services/metadata.service';
import { IncludePipe } from '../../../shared/pipes/include.pipe';
import { WorkspaceService } from '../../../workspace/services/workspace.service';

interface ColumnValues {
  key?: string;
  id?: string;
  variableId?: string,
  weighting?: string,
  description?: string,
  [key: string]: string | undefined
}

@Component({
  selector: 'studio-lite-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  standalone: true,
  imports: [MatDialogContent, MatTabGroup, MatTab, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
    MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatDialogActions,
    MatButton, MatDialogClose, TranslateModule, IncludePipe]
})

export class TableViewComponent implements OnInit {
  constructor(
    private metadataService: MetadataService,
    private workspaceService: WorkspaceService,
    private translateService: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: { units: UnitMetadataDto[], warning: string }
  ) {
  }

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  viewMode = 'units';
  workspaceId = this.workspaceService.selectedWorkspaceId;
  displayedColumns: string[] = ['key', 'id', 'variableId', 'weighting', 'description'];
  columnsToDisplay: string[] = this.viewMode === 'units' ?
    this.getTableUnitsColumnsDefinitions().slice() :
    this.getTableItemsColumnsDefinitions().slice();

  tableData: ColumnValues[] = [];

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

  private setUnitsItemsDataRows(units: UnitMetadataDto[]): void {
    const allUnits: ColumnValues[][] = [];
    units.forEach(unit => {
      const totalValues: ColumnValues[] = [];
      if (unit.metadata && unit.metadata.items) {
        unit.metadata.items.forEach((item, i: number) => {
          const activeProfile = item.profiles?.find(profile => profile.isCurrent);
          if (activeProfile && activeProfile.entries) {
            let values: ColumnValues = {};
            activeProfile.entries.forEach(entry => {
              values = this.setItemColumnValues(
                TableViewComponent.setColumnValues(values, entry),
                item,
                unit,
                i === 0);
            });
            totalValues.push(values);
          } else {
            totalValues.push({
              id: item.id || '–',
              variableId: item.variableId,
              weighting: item.weighting?.toString(),
              description: item.description
            });
          }
        });
      }
      allUnits.push(totalValues);
    });
    this.tableData = allUnits.flat();
  }

  private setItemColumnValues(values: ColumnValues,
                              item: ItemsMetadataValues,
                              unit: UnitMetadataDto,
                              addKey: boolean): ColumnValues {
    this.displayedColumns.forEach(column => {
      if (column === 'key' && addKey) {
        values.key = `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–';
      } else {
        values[column] = item[column] ? item[column]?.toString() : '';
      }
    });
    return values;
  }

  private static setColumnValues(values: ColumnValues, entry: MetadataValuesEntry): ColumnValues {
    if (Array.isArray(entry.valueAsText)) {
      if (entry.valueAsText.length > 1) {
        const textValues: string[] = [];
        entry.valueAsText.forEach(textValue => {
          textValues.push(`${textValue.value || ''}`);
        });
        values[entry.label[0].value] = textValues.join('<br>');
      } else {
        values[entry.label[0].value] = entry.valueAsText[0]?.value || '';
      }
    } else {
      values[entry.label[0].value] = entry.valueAsText?.value || '';
    }
    return values;
  }

  private setUnitsDataRows(units: UnitMetadataDto[]): void {
    const totalValues: ColumnValues[] = [];
    units.forEach(unit => {
      const activeProfile = unit.metadata &&
        unit.metadata.profiles?.find(profile => profile.isCurrent);
      if (activeProfile) {
        let values: ColumnValues = {};
        if (activeProfile.entries) {
          activeProfile.entries.forEach(entry => {
            values = TableViewComponent.setColumnValues(values, entry);
            values.key = `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–';
          });
        }
        totalValues.push(values);
      } else {
        totalValues.push({ key: `<a href=#/a/${this.workspaceId}/${unit.id}>${unit.key}</a>` || '–' });
      }
    });
    this.tableData = totalValues.flat();
  }

  private getTableItemsColumnsDefinitions(): string[] {
    if (!this.metadataService.itemProfileColumns) return [];
    const columnsDefinitions:string[] = this.metadataService.itemProfileColumns.entries
      ?.map(entry => entry.label) || [];
    return [...this.displayedColumns, ...columnsDefinitions];
  }

  private getTableUnitsColumnsDefinitions(): string[] {
    const columnsDefinitions: string[][] = [];
    if (!this.metadataService.unitProfileColumns) return [];
    this.metadataService.unitProfileColumns.forEach(group => {
      columnsDefinitions.push(group.entries.map(entry => entry.label));
    });
    return ['key', ...columnsDefinitions.flat()];
  }

  downloadMetadata(): void {
    const datePipe = new DatePipe('de-DE');
    if (this.viewMode === 'units') {
      this.metadataService.downloadUnitsMetadataReport(this.getTableUnitsColumnsDefinitions())
        .subscribe(b => {
          const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
          saveAs(b,
            `${thisDate} ${this.translateService
              .instant('metadata.unitMetadataReportFileName', { date: thisDate })}.xlsx`);
        });
    }
    if (this.viewMode === 'items') {
      this.metadataService.downloadItemsMetadataReport(this.getTableItemsColumnsDefinitions())
        .subscribe(b => {
          const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
          saveAs(b,
            `${thisDate} ${this.translateService
              .instant('metadata.itemsMetadataReportFileName', { date: thisDate })}.xlsx`);
        });
    }
  }
}
