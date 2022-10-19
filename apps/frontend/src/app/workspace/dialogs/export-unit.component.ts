import { Component, OnInit, ViewChild } from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { ModuleService } from '@studio-lite/studio-components';
import { BackendService } from '../backend.service';
import { WorkspaceService } from '../workspace.service';
import { SelectUnitListComponent } from './components/select-unit-list.component';
import { AppService } from '../../app.service';

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
    passwordLess: false,
    bookletSettings: [
      { key: 'pagingMode', value: 'separate' },
      { key: 'unit_navibuttons', value: 'FULL' }
    ]
  };

  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private moduleService: ModuleService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.backendService.getUnitListWithMetadata(
        this.workspaceService.selectedWorkspaceId
      ).subscribe(unitsWithMetadata => {
        unitsWithMetadata.forEach(umd => {
          if (umd.player) {
            const validPlayerId = VeronaModuleFactory.isValid(umd.player, Object.keys(this.moduleService.players));
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
