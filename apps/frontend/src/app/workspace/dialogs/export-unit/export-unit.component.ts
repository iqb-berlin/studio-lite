import { Component } from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../workspace.service';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss']
})
export class ExportUnitComponent {
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

  constructor(public workspaceService: WorkspaceService) {}

  updateUnitIdList(selectedUnits: number[]): void {
    this.unitExportSettings.unitIdList = selectedUnits;
  }
}
