import {
  AfterViewInit,
  Component, ElementRef, Input, OnDestroy, ViewChild
} from '@angular/core';
import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { of } from 'rxjs';
import { ReviewService } from '../../services/review.service';
import { UnitPropertiesComponent } from '../../../shared/components/unit-properties/unit-properties.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { PrintMetadataComponent } from '../../../print/components/print-metadata/print-metadata.component';
import {
  UnitPrintCommentsComponent
} from '../../../print/components/unit-print-comments/unit-print-comments.component';
import { UnitPrintCodingComponent } from '../../../print/components/unit-print-coding/unit-print-coding.component';

const PanelWidthOffset = 40;

@Component({
  selector: 'studio-lite-unit-info',
  templateUrl: './unit-info.component.html',
  styleUrls: ['./unit-info.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatIcon, MatButton, MatTooltip, WrappedIconComponent, UnitPropertiesComponent, TranslateModule, PrintMetadataComponent, UnitPrintCommentsComponent, UnitPrintCodingComponent]
})
export class UnitInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('infoPanelSplitter') splitterElement!: ElementRef;
  id = 0;
  @Input('unitId')
  set unitId(value: number) {
    this.id = value;
  }

  properties?: UnitPropertiesDto;
  @Input('unitProperties')
  set unitProperties(value: UnitPropertiesDto | undefined) {
    this.properties = value;
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

  protected readonly of = of;
}
