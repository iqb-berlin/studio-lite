import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateModule } from '@ngx-translate/core';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../shared/services/module.service';

@Component({
  selector: 'studio-lite-test-config',
  templateUrl: './test-config.component.html',
  styleUrls: ['./test-config.component.scss'],
  standalone: true,
  imports: [MatCheckbox, FormsModule, NgIf, MatFormField, MatLabel, MatInput, TranslateModule]
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
