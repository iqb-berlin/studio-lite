import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { ModuleService } from '@studio-lite/studio-components';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { BackendService } from '../../../workspace/services/backend.service';
import { AppService } from '../../../../services/app.service';

@Component({
  selector: 'studio-lite-unit-print-layout',
  templateUrl: './unit-print-layout.component.html',
  styleUrls: ['./unit-print-layout.component.scss']
})
export class UnitPrintLayoutComponent implements OnInit {
  @Input() unitId!: number;
  @Input() workspaceId!: number;

  @Output() heightChange: EventEmitter<number> = new EventEmitter<number>();
  playerHeight: number = 1700;
  message = '';
  unitMetadata!: UnitMetadataDto;
  playerId: string = '';

  constructor(
    private appService: AppService,
    private backendService: BackendService,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    this.initPlayer();
  }

  private initPlayer(): void {
    setTimeout(() => {
      this.backendService.getUnitMetadata(this.workspaceId, this.unitId)
        .subscribe(async unitMetadata => {
          if (unitMetadata) {
            await this.setMetaData(unitMetadata);
          }
        });
    });
  }

  private async setMetaData(unitMetadata: UnitMetadataDto) {
    this.unitMetadata = unitMetadata;
    if (Object.keys(this.moduleService.players).length === 0) await this.moduleService.loadList();
    this.playerId = unitMetadata.player ?
      VeronaModuleFactory.getBestMatch(unitMetadata.player, Object.keys(this.moduleService.players)) : '';
  }

  playerHeightChange(height: number) {
    this.heightChange.emit(height - this.playerHeight);
    this.playerHeight = height;
  }
}
