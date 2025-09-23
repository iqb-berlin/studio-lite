import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { CommentDialogComponent } from '../comment-dialog/comment-dialog.component';
import { ReviewService } from '../../services/review.service';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-add-comment-button',
  templateUrl: './add-comment-button.component.html',
  styleUrls: ['./add-comment-button.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class AddCommentButtonComponent {
  @Input() showOthersComments!: boolean;
  @Input() unitDbId!: number;
  constructor(private commentDialog: MatDialog,
              private reviewService:ReviewService) {}

  showReviewDialog() {
    const commentDialog = this.commentDialog.open(CommentDialogComponent, {
      width: '1000px',
      height: this.showOthersComments ? '800px' : '400px',
      panelClass: 'review-dialog'
    });
    commentDialog.afterClosed().subscribe(() => {
      this.reviewService.updateCommentsUnitInfo(this.unitDbId);
    });
  }
}
