import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import {
  BackendService,
  UnitMetadata,
  ExportUnitSelectionData,
  ModuleDataForExport
} from '../backend.service';
import { AppService } from '../../app.service';
import { WorkspaceService } from '../workspace.service';

export interface UnitExtendedData {
  id: number;
  key: string;
  label: string;
  disabled: boolean;
}

@Component({
  templateUrl: './export-unit.component.html',
  styles: [
    '.disabled-element {color: gray}',
    '.tcMessage {font-style: italic; font-size: smaller}'
  ]
})
export class ExportUnitComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UnitExtendedData>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitExtendedData>(true, []);
  addTestcenterFiles = false;
  unitsWithPlayer: number[] = [];
  usedPlayers: string[] = [];

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    public ds: WorkspaceService,
    private backendService: BackendService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  static getCodeList(codeLen: number, codeCount: number): string[] {
    const codeCharacters = 'abcdefghprqstuvxyz';
    const codeNumbers = '2345679';
    const codeList: string[] = [];
    for (let i = 0; i < codeCount; i++) {
      let newCode = '';
      do {
        newCode = '';
        let isNumber = false;
        do {
          newCode += isNumber ?
            codeNumbers.substr(Math.floor(codeNumbers.length * Math.random()), 1) :
            codeCharacters.substr(Math.floor(codeCharacters.length * Math.random()), 1);
          isNumber = !isNumber;
        } while (newCode.length < codeLen);
      } while (codeList.indexOf(newCode) >= 0);
      codeList.push(newCode);
    }
    return codeList;
  }

  ngOnInit(): void {
    this.tableSelectionCheckbox.clear();
    this.objectsDatasource = new MatTableDataSource(this.ds.unitList.map(
      ud => <UnitExtendedData>{
        id: ud.id,
        key: ud.key,
        label: ud.name,
        disabled: false
      }
    ));
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckbox.selected.length;
    let numRows = 0;
    if (this.objectsDatasource) {
      this.objectsDatasource.data.forEach(ud => {
        if (!ud.disabled) numRows += 1;
      });
    }
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => {
        if (!row.disabled) this.tableSelectionCheckbox.select(row);
      });
  }

  updateUnitList(): void {
    if (this.addTestcenterFiles) {
      if (this.unitsWithPlayer.length > 0) {
        if (this.objectsDatasource) {
          this.objectsDatasource.data.forEach(ud => {
            ud.disabled = this.unitsWithPlayer.indexOf(ud.id) < 0;
          });
        }
      } else {
        this.appService.dataLoading = true;
        const getMetadataSubscriptions: Observable<UnitMetadata>[] = [];
        this.ds.unitList.forEach(
          ud => {
            getMetadataSubscriptions.push(this.backendService.getUnitMetadata(this.ds.selectedWorkspace, ud.id));
          }
        );
        forkJoin(getMetadataSubscriptions)
          .subscribe((allMetadata: UnitMetadata[]) => {
            this.unitsWithPlayer = [];
            this.usedPlayers = [];
            allMetadata.forEach(umd => {
              if (umd.playerid) {
                const validPlayerId = WorkspaceService.validModuleId(umd.playerid, this.ds.playerList);
                if (validPlayerId !== false) {
                  this.unitsWithPlayer.push(umd.id);
                  const playerIdToAdd = validPlayerId === true ? umd.playerid : validPlayerId;
                  if (this.usedPlayers.indexOf(playerIdToAdd) < 0) this.usedPlayers.push(playerIdToAdd);
                }
              }
            });
            if (this.objectsDatasource) {
              this.objectsDatasource.data.forEach(ud => {
                ud.disabled = this.unitsWithPlayer.indexOf(ud.id) < 0;
              });
            }
            this.appService.dataLoading = false;
          });
      }
    } else {
      if (this.objectsDatasource) {
        this.objectsDatasource.data.forEach(ud => {
          ud.disabled = false;
        });
      }
    }
  }

  getResultData(): ExportUnitSelectionData {
    const returnData = <ExportUnitSelectionData>{
      selected_units: (this.tableSelectionCheckbox.selected).map(ud => ud.id),
      add_players: [],
      add_xml: []
    };
    if (this.addTestcenterFiles) {
      returnData.add_players = this.usedPlayers;
      const nowDate = new Date();
      let description = `Erzeugt mit Teststudio ${(nowDate.getDate() < 10 ? '0' : '')}${nowDate.getDate()}.`;
      description += `${(nowDate.getMonth() < 9 ? '0' : '')}${nowDate.getMonth() + 1}.`;
      description += nowDate.getFullYear().toString();
      const nsB = 'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/9.2.0/definitions/vo_Booklet.xsd';
      let bookletXml = `<?xml version="1.0" encoding="utf-8"?>
          <Booklet xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:noNamespaceSchemaLocation="${nsB}">
            <Metadata>
              <Id>Booklet1</Id>
              <Label>Beispiel-Testheft</Label>
              <Description>${description}</Description>
            </Metadata>
            <BookletConfig>
              <Config key="unit_menu">FULL</Config>
            </BookletConfig>
            <Units>
      `;
      let unitNumber = 1;
      this.tableSelectionCheckbox.selected.forEach(ud => {
        bookletXml += `<Unit id="${encodeURI(ud.key)}" label="${unitNumber}. ${encodeURI(ud.label)}" />`;
        unitNumber += 1;
      });
      bookletXml += `
          </Units>
          </Booklet>`;
      returnData.add_xml.push(<ModuleDataForExport>{
        id: 'Booklet1.Xml',
        content: bookletXml
      });
      const nsT = 'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/9.1.1/definitions/vo_Testtakers.xsd';
      let ttXml = `<?xml version="1.0" encoding="utf-8"?>
          <Testtakers xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:noNamespaceSchemaLocation="${nsT}">
            <Metadata>
              <Description>${description}</Description>
            </Metadata>
            <Group id="TestakerGroup1" label="TestakerGroup1">`;
      const names = ExportUnitComponent.getCodeList(5, 6);
      const pws = ExportUnitComponent.getCodeList(4, 6);
      for (let i = 0; i < 6; i++) {
        ttXml += `<Login mode="run-review" name="${names[i]}" pw="${pws[i]}">
            <Booklet>Booklet1</Booklet>
          </Login>
`;
      }
      ttXml += '</Group></Testtakers>';
      returnData.add_xml.push(<ModuleDataForExport>{
        id: 'TestTakers1.Xml',
        content: ttXml
      });
    }
    return returnData;
  }
}
