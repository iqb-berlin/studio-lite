import {
  Component,
  Inject, OnInit, ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver-es';
import { DatePipe } from '@angular/common';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material/tabs';
import { MetadataService } from '../../services/metadata.service';

const datePipe = new DatePipe('de-DE');

@Component({
  selector: 'studio-lite-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})

export class TableViewComponent implements OnInit {
  constructor(
    private metadataService: MetadataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  viewMode = 'units';

  displayedColumns: string[] = ['Aufgabe', 'Item-Id', 'Variablen', 'Wichtung', 'Notiz'];
  columnsToDisplay: string[] = this.viewMode === 'units' ?
    this.getTableUnitsColumnsDefinitions().slice() :
    this.getTableItemsColumnsDefinitions().slice();

  tableData: Record<string, string>[] = [];

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

  setUnitsItemsDataRows(units: any[]): any {
    const allUnits: any[] = [];
    units.forEach((unit: any) => {
      const totalValues: Record<string, string>[] = [];
      unit.metadata.items.forEach((item: any, i: number) => {
        const activeProfile: any = item.profiles?.find((profile: any) => profile.isCurrent);
        if (activeProfile) {
          const values: any = {};
          activeProfile.entries.forEach((entry: any) => {
            if (entry.valueAsText.length > 1) {
              const textValues: any[] = [];
              entry.valueAsText.forEach((textValue: any) => {
                textValues.push(`${textValue.value || ''}`);
              });
              values[entry.label[0].value] = textValues.join('<br>');
            } else {
              values[entry.label[0].value] = entry.valueAsText[0]?.value || entry.valueAsText?.value || '';
            }
            if (i === 0) values.Aufgabe = unit.key || '–';
            values['Item-Id'] = item.id || '–';
            values.Variablen = item.variableId || '';
            values.Wichtung = item.weighting || '';
            values.Notiz = item.description || '';
          });
          totalValues.push(values);
        } else {
          totalValues.push({ 'Item-Id': '–' });
        }
      });
      allUnits.push(totalValues);
    });
    this.tableData = allUnits.flat();
  }

  setUnitsDataRows(units: any): any {
    const totalValues: Record<string, string>[] = [];
    units.forEach((unit: any) => {
      const activeProfile = unit.metadata.profiles?.find((profile: any) => profile.isCurrent);
      if (activeProfile) {
        const values: Record<string, string> = {};
        activeProfile.entries.forEach((entry: any) => {
          if (entry.valueAsText.length > 1) {
            const textValues: any[] = [];
            entry.valueAsText.forEach((textValue: any) => {
              textValues.push(textValue.value || '');
            });
            values[entry.label[0].value] = textValues.join(', ');
          } else {
            values[entry.label[0].value] = entry.valueAsText[0]?.value || entry.valueAsText?.value || '';
          }
          // eslint-disable-next-line @typescript-eslint/dot-notation
          values['Aufgabe'] = unit.key || '–';
        });
        totalValues.push(values);
      } else {
        totalValues.push({ Aufgabe: unit.key || '–' });
      }
    });
    this.tableData = totalValues.flat();
  }

  getTableItemsColumnsDefinitions(): string[] {
    const columnsDefinitions:string[] = this.metadataService.itemProfileColumns.entries
      ?.map(entry => entry.label) || [];
    return [...this.displayedColumns, ...columnsDefinitions];
  }

  getTableUnitsColumnsDefinitions(): string[] {
    const columnsDefinitions:string[] = this.metadataService.unitProfileColumns.entries
      ?.map(entry => entry.label) || [];
    return ['Aufgabe', ...columnsDefinitions];
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