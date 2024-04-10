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
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import {
  // eslint-disable-next-line max-len
  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { MetadataValuesEntry, UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { MetadataService } from '../../services/metadata.service';

const datePipe = new DatePipe('de-DE');

interface ColumnValues {
  Aufgabe?: string;
  'Item-Id'?: string;
  Variablen?: string,
  Wichtung?: string,
  Notiz?: string,
  [key: string]: string | undefined
}

@Component({
  selector: 'studio-lite-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogContent, MatTabGroup, MatTab, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class TableViewComponent implements OnInit {
  constructor(
    private metadataService: MetadataService,
    @Inject(MAT_DIALOG_DATA) public data: { units: UnitMetadataDto[] }
  ) {
  }

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  viewMode = 'units';

  displayedColumns: string[] = ['Aufgabe', 'Item-Id', 'Variablen', 'Wichtung', 'Notiz'];
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
              values = TableViewComponent.setColumnValues(values, entry);
              if (i === 0) values.Aufgabe = unit.key || '–';
              values['Item-Id'] = item.id || '–';
              values.Variablen = item.variableId || '';
              values.Wichtung = item.weighting ? item.weighting.toString() : '';
              values.Notiz = item.description || '';
            });
            totalValues.push(values);
          } else {
            totalValues.push({ 'Item-Id': '–' });
          }
        });
      }
      allUnits.push(totalValues);
    });
    this.tableData = allUnits.flat();
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
            values.Aufgabe = unit.key || '–';
          });
        }
        totalValues.push(values);
      } else {
        totalValues.push({ Aufgabe: unit.key || '–' });
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
    return ['Aufgabe', ...columnsDefinitions.flat()];
  }

  downloadMetadata() {
    if (this.viewMode === 'units') {
      this.metadataService.downloadUnitsMetadataReport(this.getTableUnitsColumnsDefinitions()).subscribe(b => {
        const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
        saveAs(b, `${thisDate} Bericht Aufgaben Metadaten.xlsx`);
      });
    }
    if (this.viewMode === 'items') {
      this.metadataService.downloadItemsMetadataReport(this.getTableItemsColumnsDefinitions()).subscribe(b => {
        const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
        saveAs(b, `${thisDate} Bericht Items Metadaten.xlsx`);
      });
    }
  }
}
