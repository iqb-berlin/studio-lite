import {
  Component, EventEmitter, OnInit, Output
} from '@angular/core';
import { UnitDownloadSettingsDto } from '@studio-lite-lib/api-dto';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { ModuleService } from '@studio-lite/studio-components';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'studio-lite-testcenter-data',
  templateUrl: './testcenter-data.component.html',
  styleUrls: ['./testcenter-data.component.scss']
})
export class TestcenterDataComponent implements OnInit {
  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;
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

  @Output() unitExportSettingsChange = new EventEmitter<UnitDownloadSettingsDto>();
  @Output() unitsWithOutPlayerChange = new EventEmitter<number[]>();

  constructor(
    public workspaceService: WorkspaceService,
    private moduleService: ModuleService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
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
      this.unitExportSettingsChange.emit(this.unitExportSettings);
    });
  }

  updateDisabled(): void {
    this.unitsWithOutPlayerChange.emit(this.unitExportSettings.addPlayers ? this.unitsWithOutPlayer : []);
  }
}
