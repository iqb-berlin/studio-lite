import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReviewService } from './services/review.service';
import { AppService } from '../../services/app.service';
import { CommentDialogComponent } from './comment-dialog.component';

@Component({
  selector: 'studio-lite-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
  constructor(
    public appService: AppService,
    private route: ActivatedRoute,
    private commentDialog: MatDialog,
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const newReviewId = this.route.snapshot.params['review'];
      if (this.reviewService.reviewId !== newReviewId) {
        this.reviewService.reviewId = newReviewId;
        this.reviewService.units = [];
      }
    });
  }

  showReviewDialog() {
    this.commentDialog.open(CommentDialogComponent, {
      width: '800px',
      height: this.reviewService.reviewConfig.showOthersComments ? '800px' : '350px'
    });
  }
}
