import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../review.service';

@Component({
  selector: 'studio-lite-finish',
  templateUrl: './finish.component.html',
  styleUrls: ['./finish.component.scss']
})
export class FinishComponent implements OnInit {
  constructor(
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.reviewService.currentUnitSequenceId = this.reviewService.units.length;
      this.reviewService.currentPageHeader = `Endseite ${this.reviewService.reviewName}`;
    });
  }
}
