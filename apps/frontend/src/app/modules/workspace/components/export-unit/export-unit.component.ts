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
import { FormsModule } from '@angular/forms';
import { WorkspaceService } from '../../services/workspace.service';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';
import { ExportTestTakerConfigComponent } from '../export-test-taker-config/export-test-taker-config.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ExportUnitFileConfigComponent } from '../export-unit-file-config/export-unit-file-config.component';
import { mapBookletConfigToModernKeys } from '../../utils/booklet-config-export.utils';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, SelectUnitListComponent,
    MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle,
    ExportTestTakerConfigComponent, BookletConfigEditComponent,
    MatDialogActions, MatButton, MatDialogClose,
    TranslateModule, FormsModule, ExportUnitFileConfigComponent
  ]
})
export class ExportUnitComponent {
  unitExportSettings: UnitDownloadSettingsDto = {
    unitIdList: [],
    exportFormat: 'json',
    addComments: false,
    addRichNotes: false,
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false,
    bookletSettings: []
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

  setBookletConfigSettings(booklet: BookletConfigDto): void {
    this.unitExportSettings.bookletSettings = mapBookletConfigToModernKeys(booklet);
  }
}
