import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../review.service';

@Component({
  selector: 'studio-lite-finish',
  templateUrl: './finish.component.html',
  styles: [
    '#finish-page { height: 100%; background-color: whitesmoke; overflow: auto }',
    '.finish-data { min-width: 400px; max-width: 600px }',
    '#backwards-button { margin-top: 10px }'
  ]
})
export class FinishComponent implements OnInit {
  constructor(
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
      this.reviewService.setHeaderText('Endseite');
    });
  }
}
