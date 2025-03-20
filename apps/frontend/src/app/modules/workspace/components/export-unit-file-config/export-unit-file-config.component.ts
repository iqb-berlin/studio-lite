import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatCard } from '@angular/material/card';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ModuleService } from '../../../shared/services/module.service';

@Component({
  selector: 'studio-lite-export-unit-file-config',
  templateUrl: './export-unit-file-config.component.html',
  styleUrls: ['./export-unit-file-config.component.scss'],
  imports: [MatCheckbox, FormsModule, TranslateModule, MatCard]
})
export class ExportUnitFileConfigComponent implements OnInit {
  unitsWithOutPlayer: number[] = [];
  enablePlayerOption = true;
  @Input() addPlayers!: boolean;
  @Input() addComments!: boolean;
  @Output() addPlayersChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() addCommentsChange: EventEmitter<boolean> = new EventEmitter<boolean>();
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
