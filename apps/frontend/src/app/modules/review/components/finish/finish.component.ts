import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss']
})
export class FinishComponent implements OnInit {
  constructor(
    private translateService: TranslateService,
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.reviewService.units.length === 0) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.reviewService.loadReviewData().then(() => {
          this.reviewService.currentUnitSequenceId = this.reviewService.units.length;
        });
      } else {
        this.reviewService.currentUnitSequenceId = this.reviewService.units.length;
      }
      this.reviewService
        .setHeaderText(this.translateService.instant('review.end-page'));
    });
  }
}