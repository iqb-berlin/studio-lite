import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { ModuleService } from '../../../shared/services/module.service';
import { BackendService } from '../../../workspace/services/backend.service';
import { AppService } from '../../../../services/app.service';
import { PrintOption } from '../../models/print-options.interface';

@Component({
  selector: 'studio-lite-unit-print-layout',
  templateUrl: './unit-print-layout.component.html',
  styleUrls: ['./unit-print-layout.component.scss']
})
export class UnitPrintLayoutComponent implements OnInit {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() workspaceGroupId!: number;
  @Input() printOptions!: PrintOption[];

  @Output() heightChange: EventEmitter<number> = new EventEmitter<number>();
  playerHeight: number = 1700;
  message = '';
  unitProperties!: UnitMetadataDto;
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
      this.backendService.getUnitProperties(this.workspaceId, this.unitId)
        .subscribe(async unitProperties => {
          if (unitProperties) {
            await this.setUnitProperties(unitProperties);
          }
        });
    });
  }

  private async setUnitProperties(unitProperties: UnitMetadataDto) {
    this.unitProperties = unitProperties;
    if (Object.keys(this.moduleService.players).length === 0) await this.moduleService.loadList();
    this.playerId = unitProperties.player ?
      VeronaModuleFactory.getBestMatch(unitProperties.player, Object.keys(this.moduleService.players)) : '';
  }

  playerHeightChange(height: number) {
    this.heightChange.emit(height - this.playerHeight);
    this.playerHeight = height;
  }
}
