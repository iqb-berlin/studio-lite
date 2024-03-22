import { Component, OnInit } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFabAnchor } from '@angular/material/button';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss'],
  standalone: true,
  imports: [MatFabAnchor, MatTooltip, TranslateModule]
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
