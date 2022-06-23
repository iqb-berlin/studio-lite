import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit } from '@angular/core';
import { UnitDownloadSettingsDto, UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../backend.service';
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
    '.margin-bottom {margin-bottom: 10px}',
    '.tcMessage {font-style: italic; font-size: smaller}',
    '.disabled-element {color: gray}'
  ]
})
export class ExportUnitComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UnitExtendedData>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitExtendedData>(true, []);
  unitExportSettings = <UnitDownloadSettingsDto>{
    unitIdList: [],
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false
  };

  unitsWithPlayer: number[] = [];
  allUnitsWithMetadata: UnitMetadataDto[] = [];

  constructor(
    public ds: WorkspaceService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    this.tableSelectionCheckbox.clear();
    setTimeout(() => {
      this.backendService.getUnitListWithMetadata(this.ds.selectedWorkspace).subscribe(md => {
        this.allUnitsWithMetadata = md;
        this.allUnitsWithMetadata.forEach(umd => {
          if (umd.player) {
            const validPlayerId = this.ds.playerList.isValid(umd.player);
            if (validPlayerId !== false) this.unitsWithPlayer.push(umd.id);
          }
        });
        this.objectsDatasource = new MatTableDataSource(this.allUnitsWithMetadata.map(
          ud => <UnitExtendedData>{
            id: ud.id,
            key: ud.key,
            label: ud.name,
            disabled: false
          }
        ));
      });
    });
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
    if (this.objectsDatasource) {
      if (this.unitExportSettings.addPlayers) {
        this.objectsDatasource.data.forEach(ud => {
          ud.disabled = this.unitsWithPlayer.indexOf(ud.id) < 0;
          if (ud.disabled) this.tableSelectionCheckbox.deselect(ud);
        });
      } else {
        this.objectsDatasource.data.forEach(ud => {
          ud.disabled = false;
        });
      }
    }
  }

  getResultData(): UnitDownloadSettingsDto {
    this.unitExportSettings.unitIdList = (this.tableSelectionCheckbox.selected).map(ud => ud.id);
    return this.unitExportSettings;
  }
}
