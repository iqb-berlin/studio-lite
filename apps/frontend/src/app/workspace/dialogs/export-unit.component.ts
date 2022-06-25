import {Component, OnInit, ViewChild} from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../backend.service';
import { WorkspaceService } from '../workspace.service';
import { SelectUnitListComponent } from './select-unit-list/select-unit-list.component';

@Component({
  templateUrl: './export-unit.component.html',
  styles: [
    '.margin-bottom {margin-bottom: 10px}',
    '.tcMessage {font-style: italic; font-size: smaller}'
  ]
})
export class ExportUnitComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  unitExportSettings = <UnitDownloadSettingsDto>{
    unitIdList: [],
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false
  };

  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;

  constructor(
    public ds: WorkspaceService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.backendService.getUnitListWithMetadata(this.ds.selectedWorkspace).subscribe(unitsWithMetadata => {
        unitsWithMetadata.forEach(umd => {
          if (umd.player) {
            const validPlayerId = this.ds.playerList.isValid(umd.player);
            if (validPlayerId === false) this.unitsWithOutPlayer.push(umd.id);
          } else {
            this.unitsWithOutPlayer.push(umd.id);
          }
        });
        this.enablePlayerOption = this.unitsWithOutPlayer.length < unitsWithMetadata.length;
      });
    });
  }

  updateDisabled(): void {
    if (this.unitSelectionTable) {
      this.unitSelectionTable.disabled = this.unitExportSettings.addPlayers ?
        this.unitsWithOutPlayer : [];
    }
  }

  getResultData(): UnitDownloadSettingsDto {
    this.unitExportSettings.unitIdList = this.unitSelectionTable ? this.unitSelectionTable.selectedUnitIds : [];
    return this.unitExportSettings;
  }
}
