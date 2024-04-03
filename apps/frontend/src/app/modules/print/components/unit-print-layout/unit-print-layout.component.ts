import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { VeronaModuleFactory } from '@studio-lite/shared-code';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';

import { ModuleService } from '../../../shared/services/module.service';
import { BackendService } from '../../../workspace/services/backend.service';
import { AppService } from '../../../../services/app.service';
import { PrintOption } from '../../models/print-options.interface';
import { IncludePipe } from '../../../shared/pipes/include.pipe';
import { UnitPrintPlayerComponent } from '../unit-print-player/unit-print-player.component';
import { UnitPrintCodingComponent } from '../unit-print-coding/unit-print-coding.component';
import { UnitPrintCommentsComponent } from '../unit-print-comments/unit-print-comments.component';
import { PrintMetadataComponent } from '../print-metadata/print-metadata.component';
import { UnitPropertiesComponent } from '../../../shared/components/unit-properties/unit-properties.component';

@Component({
  selector: 'studio-lite-unit-print-layout',
  templateUrl: './unit-print-layout.component.html',
  styleUrls: ['./unit-print-layout.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [UnitPropertiesComponent, PrintMetadataComponent, UnitPrintCommentsComponent, UnitPrintCodingComponent, UnitPrintPlayerComponent, MatFormField, MatLabel, MatInput, FormsModule, IncludePipe, TranslateModule]
})
export class UnitPrintLayoutComponent implements OnInit {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() workspaceGroupId!: number;
  @Input() printPreviewHeight!: number;
  @Input() printOptions!: PrintOption[];

  @Output() heightChange: EventEmitter<number> = new EventEmitter<number>();
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
    this.heightChange.emit(height - this.printPreviewHeight);
    this.printPreviewHeight = height;
  }
}
