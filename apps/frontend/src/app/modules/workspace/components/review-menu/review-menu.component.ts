import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-review-menu',
  templateUrl: './review-menu.component.html',
  styleUrls: ['./review-menu.component.scss']
})
export class ReviewMenuComponent {
  @Input() selectedReviewId!: number;
  @Input() changed!: boolean;
  @Input() units!: number[];
  @Input() workspaceId!: number;
  @Input() workspaceGroupId!: number;
  @Input() link!: string;
  @Input() passwordLength!: number;
  @Input() bookletConfigSettings!: BookletConfigDto | undefined;

  @Output() changedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() reviewListChange: EventEmitter<number | undefined> = new EventEmitter<number | undefined>();
}
