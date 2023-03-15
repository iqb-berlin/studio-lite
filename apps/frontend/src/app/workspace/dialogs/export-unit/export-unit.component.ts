import { Component } from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../../workspace.service';

@Component({
  templateUrl: './export-unit.component.html',
  styleUrls: ['export-unit.component.scss']
})
export class ExportUnitComponent {
  unitExportSettings!: UnitDownloadSettingsDto;

  constructor(public workspaceService: WorkspaceService) {}

  updateUnitExportSettings(unitExportSettings: UnitDownloadSettingsDto) {
    const selectedUnits = this.unitExportSettings ? this.unitExportSettings.unitIdList : [];
    this.unitExportSettings = unitExportSettings;
    this.unitExportSettings.unitIdList = selectedUnits;
  }

  updateUnitIdList(selectedUnits: number[]): void {
    if (this.unitExportSettings) {
      this.unitExportSettings.unitIdList = selectedUnits;
    }
  }
}
