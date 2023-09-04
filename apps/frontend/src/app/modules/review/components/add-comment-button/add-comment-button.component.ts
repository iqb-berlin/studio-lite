import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommentDialogComponent } from '../comment-dialog/comment-dialog.component';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-add-comment-button',
  templateUrl: './add-comment-button.component.html',
  styleUrls: ['./add-comment-button.component.scss']
})
export class AddCommentButtonComponent {
  @Input() showOthersComments!: boolean;
  @Input() unitDbId!: number;
  constructor(private commentDialog: MatDialog,
              private reviewService:ReviewService) {}

  showReviewDialog() {
    const commentDialog = this.commentDialog.open(CommentDialogComponent, {
      width: '1000px',
      height: this.showOthersComments ? '800px' : '350px'
    });
    commentDialog.afterClosed().subscribe(() => {
      this.reviewService.updateCommentsUnitInfo(this.unitDbId);
    });
  }
}
