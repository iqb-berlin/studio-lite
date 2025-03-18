import {
  AfterViewInit,
  Component, ElementRef, Input, OnDestroy, ViewChild
} from '@angular/core';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';

import { MatIcon } from '@angular/material/icon';
import { BackendService } from '../../services/backend.service';
import { ReviewService } from '../../services/review.service';
import { UnitInfoCommentsComponent } from '../unit-info-comments/unit-info-comments.component';
import { UnitInfoCodingComponent } from '../unit-info-coding/unit-info-coding.component';
import { UnitPropertiesComponent } from '../../../shared/components/unit-properties/unit-properties.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

const PanelWidthOffset = 40;

@Component({
    selector: 'studio-lite-unit-info',
    templateUrl: './unit-info.component.html',
    styleUrls: ['./unit-info.component.scss'],
    // eslint-disable-next-line max-len
    imports: [MatIcon, MatButton, MatTooltip, WrappedIconComponent, UnitPropertiesComponent, UnitInfoCodingComponent, UnitInfoCommentsComponent, TranslateModule]
})
export class UnitInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('infoPanelSplitter') splitterElement!: ElementRef;
  _unitId = 0;
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
  }

  _unitMetadata?: UnitMetadataDto;
  @Input('unitMetadata')
  set unitMetadata(value: UnitMetadataDto | undefined) {
    this._unitMetadata = value;
  }

  set elementWidth(value: number) {
    this.elementRef.nativeElement.style.width = value === 0 ?
      `${PanelWidthOffset.toString()}px` : `${(value + PanelWidthOffset).toString()}px`;
    this.reviewService.unitInfoPanelOn = value > 0;
    if (value > 0) this.reviewService.unitInfoPanelWidth = value;
  }

  get elementWidth(): number {
    return parseInt(this.elementRef.nativeElement.style.width, 10) - PanelWidthOffset;
  }

  private mouseXOffset = 0;

  constructor(
    private backendService: BackendService,
    public reviewService: ReviewService,
    private elementRef: ElementRef
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.elementWidth = this.reviewService.unitInfoPanelWidth;
      if (this.splitterElement) {
        this.splitterElement.nativeElement.onmousedown = ($eventDown: MouseEvent) => {
          this.mouseXOffset = $eventDown.clientX + this.elementWidth;
          this.elementRef.nativeElement.onmousemove = ($eventMove: MouseEvent) => {
            if ($eventMove.buttons) {
              this.elementWidth = this.mouseXOffset - $eventMove.clientX;
            } else {
              this.elementRef.nativeElement.onmousemove = null;
              this.elementRef.nativeElement.onmouseup = null;
              this.mouseXOffset = 0;
            }
          };
          this.elementRef.nativeElement.onmouseup = () => {
            this.elementRef.nativeElement.onmousemove = null;
            this.elementRef.nativeElement.onmouseup = null;
            this.mouseXOffset = 0;
          };
        };
      }
    });
  }

  ngOnDestroy(): void {
    if (this.splitterElement) {
      this.splitterElement.nativeElement.onmousedown = null;
      this.elementRef.nativeElement.onmousemove = null;
      this.elementRef.nativeElement.onmouseup = null;
    }
  }
}
