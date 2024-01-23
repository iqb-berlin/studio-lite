import {
  Component, EventEmitter, Input, OnInit, Output,
  Inject, ViewChild
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MetadataService } from '../../services/metadata.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';

export interface TableRow {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'studio-lite-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})

export class TableViewComponent implements OnInit {
  constructor(private workspaceService: WorkspaceService,
              private metadataService: MetadataService,
              @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  @Input() variables!: string[];
  @Input() metadata!: any;
  @Output() metadataChange: EventEmitter<any> = new EventEmitter();

  displayedColumns: string[] = ['Aufgabe', 'Item-Id', 'Variablen', 'Wichtung', 'Notiz'];
  columnsToDisplay: string[] = this.getTableColumnsDefinitions().slice();
  tableData: any = [];
  @ViewChild(MatTable)
    table!: MatTable<any>;

  ngOnInit(): void {
    this.getTableColumnsDefinitions();
    this.getUnitsItemsDataRows(this.data.units);
  }

  getUnitsItemsDataRows(units: any[]): any {
    const allUnits: any[] = [];
    units.forEach((unit: any) => {
      const totalValues: any[] = [];
      // totalValues.push({ Aufgabe: unit.key });
      unit.metadata.items.forEach((item: any, i: number) => {
        const activeProfile: any = item.profiles?.find((profile: any) => profile.isCurrent);
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
              values[entry.label[0].value] = entry.valueAsText[0]?.value;
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

  getTableColumnsDefinitions(): string[] {
    const metadataItems = this.data.units[0].metadata.items;
    const activeProfile = metadataItems[0].profiles?.find((profile: any) => profile.isCurrent);
    const columnsDefinitions = activeProfile?.entries?.map((entry: any) => entry.label[0].value);
    return [...this.displayedColumns, ...columnsDefinitions];
  }
}
