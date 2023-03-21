import { Component, Inject, OnInit } from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from '../../workspace.service';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss']
})
export class ExportUnitComponent implements OnInit {
  unitExportSettings: UnitDownloadSettingsDto = {
    unitIdList: [],
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false,
    bookletSettings: []
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[], pagingMode: string, unitNaviButtons: string },
    public workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.unitExportSettings.bookletSettings = [
      {
        key: 'pagingMode',
        value: this.data?.pagingMode ? this.data.pagingMode : 'separate'
      },
      {
        key: 'unit_navibuttons',
        value: this.data?.unitNaviButtons ? this.data.unitNaviButtons : 'FULL'
      }
    ];
  }
}
