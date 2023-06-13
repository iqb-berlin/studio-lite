import {
  AfterViewInit,
  Component, ElementRef, Input, OnDestroy, ViewChild
} from '@angular/core';
import { UnitMetadataDto } from '@studio-lite-lib/api-dto';
import { DatePipe } from '@angular/common';
import { BackendService } from '../../services/backend.service';
import { ReviewService } from '../../services/review.service';

const PanelWidthOffset = 40;
const datePipe = new DatePipe('de-DE');

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
      <div #infoPanel class="infoPanel" fxFlex>
        <h1>{{_unitMetadata?.key}}</h1>
        <h2 *ngIf="_unitMetadata && _unitMetadata.name">{{_unitMetadata.name}}</h2>
        <p *ngIf="_unitLastChangeText" [innerHTML]="_unitLastChangeText"></p>
        <p *ngIf="_unitDescription" [innerHTML]="_unitDescription"></p>
        <unit-info-coding *ngIf="reviewService.reviewConfig.showCoding && _unitMetadata"
                          [unitId]="_unitId"></unit-info-coding>
        <unit-info-comments *ngIf="reviewService.reviewConfig.showOthersComments && _unitMetadata"
                          [unitId]="_unitId"></unit-info-comments>
      </div>
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
      overflow-x: auto;
    }`,
    `.infoPanelSplitter {
      background-color: lightgray;
      cursor: col-resize;
    }`,
    `.infoPanel p {
      text-indent: -1em;
      margin-left: 1em;
    }`
  ]
})
export class UnitInfoComponent implements AfterViewInit, OnDestroy {
  @ViewChild('infoPanelSplitter') splitterElement!: ElementRef;
  _unitId = 0;
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
  }

  _unitMetadata?: UnitMetadataDto;
  _unitLastChangeText = '';
  _unitDescription = '';
  @Input('unitMetadata')
  set unitMetadata(value: UnitMetadataDto | undefined) {
    this._unitMetadata = value;
    if (value) {
      this._unitLastChangeText = `Zuletzt geändert:<br/>Eigenschaften: ${value.lastChangedMetadata ?
        datePipe.transform(value.lastChangedMetadata, 'dd.MM.yyyy HH:mm') : '-'}<br/>
Definition:  ${value.lastChangedDefinition ?
    datePipe.transform(value.lastChangedDefinition, 'dd.MM.yyyy HH:mm') : '-'}<br/>
Kodierschema: ${value.lastChangedScheme ? datePipe.transform(value.lastChangedScheme, 'dd.MM.yyyy HH:mm') : '-'}`;
      this._unitDescription = value.description ?
        `Beschreibung:<br/> ${value.description.replace(/\n/g, '<br/>')}` : '';
    } else {
      this._unitLastChangeText = '';
      this._unitDescription = '';
    }
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
