import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import {
  MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import { ReviewConfigEditComponent } from '../review-config-edit/review-config-edit.component';
import { BookletConfigEditComponent } from '../booklet-config-edit/booklet-config-edit.component';

@Component({
  selector: 'studio-lite-review-config',
  templateUrl: './review-config.component.html',
  styleUrls: ['./review-config.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatFormField, MatInput, FormsModule, ReviewConfigEditComponent, BookletConfigEditComponent, TranslateModule, MatLabel]
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
