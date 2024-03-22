import { Component, Inject } from '@angular/core';
import { BookletConfigDto, UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import {
  MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { WorkspaceService } from '../../services/workspace.service';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';
import { TestConfigComponent } from '../test-config/test-config.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatDialogContent, SelectUnitListComponent, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, TestConfigComponent, BookletConfigEditComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
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
