import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
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

  @Input() addTestTakersReview!: number;
  @Input() addTestTakersHot!: number;
  @Input() addTestTakersMonitor!: number;
  @Input() addPlayers!: boolean;
  @Input() passwordLess!: boolean;
  @Input() pagingMode!: string;
  @Input() navigationButtons!: string;

  @Output() addTestTakersReviewChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTestTakersHotChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTestTakersMonitorChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addPlayersChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() passwordLessChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() pagingModeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() navigationButtonsChange: EventEmitter<string> = new EventEmitter<string>();

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
          if (!validPlayerId) this.unitsWithOutPlayer.push(umd.id);
        } else {
          this.unitsWithOutPlayer.push(umd.id);
        }
      });
      this.enablePlayerOption = this.unitsWithOutPlayer.length < unitsWithMetadata.length;
    });
  }
}
