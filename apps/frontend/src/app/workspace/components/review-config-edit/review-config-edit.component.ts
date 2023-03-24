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
  selector: 'studio-lite-review-config-edit',
  templateUrl: './review-config-edit.component.html',
  styleUrls: ['./review-config-edit.component.scss']
})

export class ReviewConfigEditComponent {
  reviewConfig: ReviewConfigDto = reviewConfigDefault;
  @Output() configChanged = new EventEmitter<ReviewConfigDto>();
  @Input('disabled') disabled = false;
  @Input('config')
  set config(value: ReviewConfigDto | undefined) {
    this.reviewConfig = value || reviewConfigDefault;
  }

  get config(): ReviewConfigDto {
    return this.reviewConfig;
  }
}
