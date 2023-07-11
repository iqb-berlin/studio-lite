import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})

export class StartComponent implements OnInit {
  constructor(
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (this.reviewService.units.length === 0) {
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.reviewService.loadReviewData();
      }
      this.reviewService.setHeaderText('Startseite');
      this.reviewService.currentUnitSequenceId = -1;
    });
  }
}
