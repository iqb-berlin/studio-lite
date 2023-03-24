import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { ModuleService } from '@studio-lite/studio-components';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { WorkspaceService } from '../../workspace.service';
import { BackendService } from '../../backend.service';

@Component({
  selector: 'studio-lite-test-config',
  templateUrl: './test-config.component.html',
  styleUrls: ['./test-config.component.scss']
})
export class TestConfigComponent implements OnInit {
  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;

  @Input() addTestTakersReview!: number;
  @Input() addTestTakersHot!: number;
  @Input() addTestTakersMonitor!: number;
  @Input() addPlayers!: boolean;
  @Input() passwordLess!: boolean;

  @Output() addTestTakersReviewChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTestTakersHotChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addTestTakersMonitorChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() addPlayersChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() passwordLessChange: EventEmitter<boolean> = new EventEmitter<boolean>();

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
