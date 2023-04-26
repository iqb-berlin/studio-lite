import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../review.service';

@Component({
  selector: 'studio-lite-start',
  templateUrl: './start.component.html',
  styles: [
    '#start-page { height: 100%; background-color: whitesmoke; overflow: auto }',
    '.start-data { min-width: 400px; max-width: 600px }',
    '#continue-button { margin-top: 10px }'
  ]
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
