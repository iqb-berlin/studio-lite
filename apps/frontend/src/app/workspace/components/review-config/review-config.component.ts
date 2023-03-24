import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-review-config',
  templateUrl: './review-config.component.html',
  styleUrls: ['./review-config.component.scss']
})
export class ReviewConfigComponent {
  @Input() selectedReviewId!: number;
  @Input() name!: string | undefined;
  @Input() password!: string | undefined;
  @Input() bookletConfigSettings!: BookletConfigDto | undefined;
  @Input() reviewConfigSettings!: ReviewConfigDto | undefined;

  @Output() nameChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() passwordChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() reviewChange: EventEmitter<null> = new EventEmitter<null>();

  @Output() bookletConfigSettingsChange: EventEmitter<BookletConfigDto> =
    new EventEmitter<BookletConfigDto>();

  @Output() reviewConfigSettingsChange: EventEmitter<ReviewConfigDto> =
    new EventEmitter<ReviewConfigDto>();
}
