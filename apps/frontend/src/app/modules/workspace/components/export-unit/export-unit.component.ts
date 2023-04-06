import { Component, Inject } from '@angular/core';
import { BookletConfigDto, UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss']
})
export class ExportUnitComponent {
  unitExportSettings: UnitDownloadSettingsDto = {
    unitIdList: [],
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false,
    bookletSettings: []
  };

  readonly bookletKeyMap = {
    pagingMode: 'pagingMode',
    pageNaviButtons: 'page_navibuttons',
    unitNaviButtons: 'unit_navibuttons',
    controllerDesign: 'controller_design',
    unitScreenHeader: 'unit_screenheader',
    unitTitle: 'unit_title'
  };

  bookletConfigSettings: BookletConfigDto | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[], bookletConfigSettings: BookletConfigDto },
    public workspaceService: WorkspaceService
  ) {
    if (this.data && this.data.bookletConfigSettings) {
      this.bookletConfigSettings = data.bookletConfigSettings;
      this.setBookletConfigSettings(this.bookletConfigSettings);
    }
  }

  setBookletConfigSettings(booklet: BookletConfigDto) {
    this.unitExportSettings.bookletSettings = Object.keys(booklet)
      .map(key => ({
        key: this.bookletKeyMap[key as keyof BookletConfigDto] as string,
        value: booklet[key as keyof BookletConfigDto] as string
      }))
      .filter(config => config.value !== '');
  }
}
