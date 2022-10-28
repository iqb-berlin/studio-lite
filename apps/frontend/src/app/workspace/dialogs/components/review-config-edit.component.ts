import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ReviewConfigDto } from '@studio-lite-lib/api-dto';

const reviewConfigDefault: ReviewConfigDto = {
  canComment: false,
  showCoding: false,
  showMetadata: false
};

@Component({
  selector: 'review-config-edit',
  template: `
    <div fxLayout="column">
      <mat-checkbox (change)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="reviewConfig.showCoding">
        Zeige Kodierung
      </mat-checkbox>
      <mat-checkbox (change)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="reviewConfig.canComment">
        Kommentare möglich
      </mat-checkbox>
      <mat-checkbox (change)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="reviewConfig.showOthersComments">
        Zeige bereits vergebene Kommentare
      </mat-checkbox>
    </div>
  `
})
export class ReviewConfigEditComponent {
  reviewConfig: ReviewConfigDto = reviewConfigDefault;
  @Output() configChanged = new EventEmitter();
  @Input('disabled') disabled = false;
  @Input('config')
  set config(value: ReviewConfigDto | undefined) {
    this.reviewConfig = value || reviewConfigDefault;
  }

  get config(): ReviewConfigDto {
    return this.reviewConfig;
  }
}
