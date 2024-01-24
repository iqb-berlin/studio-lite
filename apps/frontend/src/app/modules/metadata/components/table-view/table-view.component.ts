import {
  Component, OnInit,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver-es';
import { DatePipe } from '@angular/common';
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

  displayedColumns: string[] = ['Aufgabe', 'Item-Id', 'Variablen', 'Wichtung', 'Notiz'];
  columnsToDisplay: string[] = this.data.report === 'items' ?
    this.getTableItemsColumnsDefinitions().slice() :
    this.getTableUnitsColumnsDefinitions().slice();

  tableData: any = [];

  ngOnInit(): void {
    if (this.data.report === 'items') {
      this.getTableItemsColumnsDefinitions();
      this.getUnitsItemsDataRows(this.data.units);
    }
    if (this.data.report === 'units') {
      this.getTableUnitsColumnsDefinitions();
      this.getUnitsDataRows(this.data.units);
    }
  }

  getUnitsItemsDataRows(units: any[]): any {
    const allUnits: any[] = [];
    units.forEach((unit: any) => {
      const totalValues: any[] = [];
      unit.metadata.items.forEach((item: any, i: number) => {
        const activeProfile: any = item.profiles?.find((profile: any) => profile.isCurrent);
        if (activeProfile) {
          const values: any = {};
          activeProfile.entries.forEach((entry: any) => {
            if (entry.valueAsText.length > 1) {
              const textValues: any[] = [];
              entry.valueAsText.forEach((textValue: any) => {
                textValues.push(`${textValue.value}`);
              });
              values[entry.label[0].value] = textValues.join('<br>');
            } else {
              values[entry.label[0].value] = entry.valueAsText[0]?.value || entry.valueAsText?.value;
            }
            if (i === 0) values.Aufgabe = unit.key;
            values['Item-Id'] = item.id;
            values.Variablen = item.variableId;
            values.Wichtung = item.weighting;
            values.Notiz = item.description;
          });
          totalValues.push(values);
        }
      });
      allUnits.push(totalValues);
    });
    this.tableData = allUnits.flat();
  }

  getTableItemsColumnsDefinitions(): string[] {
    const metadataItems = this.data.units[0].metadata.items;
    const activeProfile = metadataItems[1].profiles?.find((profile: any) => profile.isCurrent);
    const columnsDefinitions = activeProfile?.entries?.map((entry: any) => entry.label[0].value);
    if (!columnsDefinitions) return [];
    return [...this.displayedColumns, ...columnsDefinitions];
  }

  getTableUnitsColumnsDefinitions(): string[] {
    const metadataUnits = this.data.units[0].metadata.profiles;
    const activeProfile = metadataUnits?.find((profile: any) => profile.isCurrent);
    const columnsDefinitions: string[] = activeProfile?.entries?.map((entry: any) => entry.label[0].value);
    if (!columnsDefinitions) return [];
    return ['Aufgabe', ...columnsDefinitions];
  }

  getUnitsDataRows(units: any[]): any {
    const totalValues: any[] = [];
    units.forEach((unit: any) => {
      const activeProfile = unit.metadata.profiles?.find((profile: any) => profile.isCurrent);
      if (activeProfile) {
        const values: any = {};
        activeProfile.entries.forEach((entry: any) => {
          if (entry.valueAsText.length > 1) {
            const textValues: any[] = [];
            entry.valueAsText.forEach((textValue: any) => {
              textValues.push(textValue.value);
            });
            values[entry.label[0].value] = textValues.join(', ');
          } else {
            values[entry.label[0].value] = entry.valueAsText[0]?.value || entry.valueAsText?.value;
          }
          values.Aufgabe = unit.key;
        });
        totalValues.push(values);
      }
    });
    this.tableData = totalValues.flat();
  }

  downloadItemsMetadata() {
    this.metadataService.downloadItemsMetadataReport().subscribe(b => {
      const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
      saveAs(b, `${thisDate} Bericht Metadaten Aufgaben Items.xlsx`);
    });
  }

  downloadUnitsMetadata() {
    this.metadataService.downloadUnitsMetadataReport().subscribe(b => {
      const thisDate = datePipe.transform(new Date(), 'yyyy-MM-dd');
      saveAs(b, `${thisDate} Bericht Aufgaben Metadaten.xlsx`);
    });
  }
}
