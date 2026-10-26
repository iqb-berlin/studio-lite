import { Component, Inject } from '@angular/core';
import { BookletConfigDto, UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import {
  MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { WorkspaceService } from '../../services/workspace.service';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';
import { ExportTestTakerConfigComponent } from '../export-test-taker-config/export-test-taker-config.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ExportUnitFileConfigComponent } from '../export-unit-file-config/export-unit-file-config.component';
import { mapBookletConfigToModernKeys, normalizeLegacyBookletConfig } from '../../utils/booklet-config-export.utils';
import { HasTakersPipe } from '../../pipes/has-takers.pipe';
import { ExportFileSelection, ExportFormat } from '../../utils/export-file-options.utils';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss'],
  imports: [
    MatDialogTitle, MatDialogContent, SelectUnitListComponent,
    MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription,
    ExportTestTakerConfigComponent, BookletConfigEditComponent,
    MatDialogActions, MatButton, MatDialogClose,
    TranslateModule, FormsModule, ExportUnitFileConfigComponent,
    MatFormField, MatLabel, MatError, MatInput, MatSelect, MatOption,
    HasTakersPipe
  ]
})
export class ExportUnitComponent {
  unitExportSettings: UnitDownloadSettingsDto = {
    unitIdList: [],
    exportFormat: 'xml',
    addComments: false,
    addRichNotes: false,
    addPlayers: false,
    addTestTakersReview: 0,
    addTestTakersMonitor: 0,
    addTestTakersHot: 0,
    passwordLess: false,
    bookletId: 'booklet1',
    bookletLabel: 'Testheft 1',
    groupLabel: 'Gruppe 1',
    bookletSettings: []
  };

  bookletConfigSettings: BookletConfigDto | undefined;

  // The download button locks while the booklet id is invalid, so the reason shows while typing, not only on blur.
  readonly showErrorWhileTyping = new ShowOnDirtyErrorStateMatcher();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { units: number[], bookletConfigSettings: BookletConfigDto },
    public workspaceService: WorkspaceService
  ) {
    if (this.data && this.data.bookletConfigSettings) {
      this.bookletConfigSettings = normalizeLegacyBookletConfig(data.bookletConfigSettings);
      this.setBookletConfigSettings(this.bookletConfigSettings);
    }
  }

  // The testcenter reads units only as XML, so the JSON format comes without logins and booklet.
  setExportFormat(format: ExportFormat): void {
    this.unitExportSettings.exportFormat = format;
    if (format === 'json') {
      this.unitExportSettings.addTestTakersReview = 0;
      this.unitExportSettings.addTestTakersHot = 0;
      this.unitExportSettings.addTestTakersMonitor = 0;
    }
  }

  setBookletConfigSettings(booklet: BookletConfigDto): void {
    this.unitExportSettings.bookletSettings = mapBookletConfigToModernKeys(booklet);
  }

  // addMetadata, addItems and addCodingScheme stay unset until the file config knows what the
  // units hold -- unset means "add" to the API, as before these files became optional. Merged in
  // place: the selection arrives during change detection, and a new settings object would change a
  // binding that was already checked.
  setFileSelection(selection: ExportFileSelection): void {
    Object.assign(this.unitExportSettings, selection);
  }
}
