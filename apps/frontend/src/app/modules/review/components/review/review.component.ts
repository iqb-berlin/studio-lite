import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { AppService } from '../../../../services/app.service';
import { AddCommentButtonComponent } from '../add-comment-button/add-comment-button.component';
import { UnitNavComponent } from '../unit-nav/unit-nav.component';

@Component({
  selector: 'studio-lite-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  imports: [UnitNavComponent, AddCommentButtonComponent, RouterOutlet]
})
export class ReviewComponent implements OnInit {
  constructor(
    public appService: AppService,
    private route: ActivatedRoute,
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
}
