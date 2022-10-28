import {
  AfterViewInit,
  Component, ElementRef, Input, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { BackendService } from '../backend.service';
import { ReviewService } from '../review.service';

export interface SelectUnitData {
  title: string,
  buttonLabel: string,
  fromOtherWorkspacesToo: boolean,
  multiple: boolean
}

const PanelWidthOffset = 40;
@Component({
  selector: 'unit-info',
  template: `
    <div fxLayout="row" fxLayoutAlign="space-between stretch" class="unit-info-content">
      <div class="infoPanelExpandButton" fxFlex="40px" fxLayout="column" fxLayoutAlign="start center">
        <mat-icon>info</mat-icon>
        <button mat-button *ngIf="reviewService.unitInfoPanelOn"
                (click)="elementWidth = 0"
                matTooltip="Weitere Informationen"
        >
          <mat-icon>chevron_right</mat-icon>
        </button>
        <button mat-button *ngIf="!reviewService.unitInfoPanelOn"
                (click)="elementWidth = reviewService.unitInfoPanelWidth"
                matTooltip="Weitere Informationen"
        >
          <mat-icon>chevron_left</mat-icon>
        </button>
      </div>
      <div #infoPanelSplitter class="infoPanelSplitter" fxFlex="6px"></div>
      <div #infoPanel class="infoPanel" fxFlex>{{reviewService.unitInfoPanelWidth}}</div>
    </div>
  `,
  styles: [
    `.unit-info-content {
      height: 100%;
      background-color: whitesmoke;
    }`,
    `.infoPanelExpandButton {
      height: 100%;
      padding-top: 6px;
    }`,
    `.infoPanelExpandButton button {
      min-width: 0;
      padding: 0 6px;
    }`,
    `.infoPanel {
      padding: 10px;
    }`,
    `.infoPanelSplitter {
      background-color: lightgray;
      cursor: col-resize;
    }`
  ]
})
export class UnitInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('infoPanelSplitter') splitterElement!: ElementRef;
  _unitId = 0;
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
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

  ngOnInit(): void {
    console.log('UnitInfoComponent');
  }

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
