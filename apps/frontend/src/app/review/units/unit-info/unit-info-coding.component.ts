import {
  AfterViewInit,
  Component, ElementRef, Input, ViewChild
} from '@angular/core';
import { CodingSchemeDto } from '@studio-lite/shared-code';
import { BackendService } from '../../backend.service';
import { ReviewService } from '../../review.service';

@Component({
  selector: 'unit-info-coding',
  template: `
    <div fxLayout="column">
      <div class="unit-info-coding-header">Kodierung</div>
      <div #codingContent class="unit-info-coding-content"></div>
    </div>
  `,
  styles: [
    `.unit-info-coding-header {
      align-content: stretch;
      background-color: rgba(65,208,247,0.32);
      font-size: large;
      padding: 2px 6px;
    }`
  ]
})
export class UnitInfoCodingComponent implements AfterViewInit {
  @ViewChild('codingContent') contentElement!: ElementRef;
  _unitDbId = 0;
  @Input('unitDbId')
  set unitDbId(value: number) {
    this._unitDbId = value;
    this.updateContent();
  }

  constructor(
    private backendService: BackendService,
    public reviewService: ReviewService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateContent();
    });
  }

  updateContent() {
    if (this._unitDbId) {
      this.backendService.getUnitCoding(this.reviewService.reviewId, this._unitDbId)
        .subscribe(unitScheme => {
          if (unitScheme) {
            const codingScheme: CodingSchemeDto = JSON.parse(unitScheme.scheme);
            let codingText = '';
            codingScheme.variableCodings.forEach(v => {
              codingText += `<h4>${v.id}</h4>${v.manualInstruction}`;
            });
            this.contentElement.nativeElement.innerHTML = codingText;
          } else {
            this.contentElement.nativeElement.innerHTML = 'Konnte Kodierschemas nicht laden.';
          }
        });
    }
  }
}
