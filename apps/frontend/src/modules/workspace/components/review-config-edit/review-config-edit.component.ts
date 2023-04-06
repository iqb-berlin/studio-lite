import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ReviewConfigDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-review-config-edit',
  templateUrl: './review-config-edit.component.html',
  styleUrls: ['./review-config-edit.component.scss']
})

export class ReviewConfigEditComponent {
  reviewConfig!: ReviewConfigDto;
  @Output() configChanged = new EventEmitter<ReviewConfigDto>();
  @Input('disabled') disabled = false;
  @Input('config')
  set config(value: ReviewConfigDto | undefined) {
    this.reviewConfig = value || {
      canComment: false,
      showCoding: false,
      showMetadata: false
    };
  }
}
