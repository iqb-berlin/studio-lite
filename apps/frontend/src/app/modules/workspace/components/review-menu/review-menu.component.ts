import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { CopyReviewLinkButtonComponent } from '../copy-review-link-button/copy-review-link-button.component';
import { PrintReviewButtonComponent } from '../print-review-button/print-review-button.component';
import { ExportReviewButtonComponent } from '../export-review-button/export-review-button.component';
import { StartReviewButtonComponent } from '../start-review-button/start-review-button.component';
import { DeleteReviewButtonComponent } from '../delete-review-button/delete-review-button.component';
import { AddReviewButtonComponent } from '../add-review-button/add-review-button.component';

@Component({
  selector: 'studio-lite-review-menu',
  templateUrl: './review-menu.component.html',
  styleUrls: ['./review-menu.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [AddReviewButtonComponent, DeleteReviewButtonComponent, StartReviewButtonComponent, ExportReviewButtonComponent, PrintReviewButtonComponent, CopyReviewLinkButtonComponent]
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
