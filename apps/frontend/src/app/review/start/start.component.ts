import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../review.service';

@Component({
  selector: 'studio-lite-start',
  templateUrl: './start.component.html',
  styles: [
    '#start-page {height: 100%; background-color: whitesmoke; overflow: auto}',
    '.start-data {min-width: 500px}',
    '#continue-button { margin-top: 10px}'
  ]
})
export class StartComponent implements OnInit {
  constructor(
    public reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.reviewService.currentUnitSequenceId = -1;
      this.reviewService.setHeaderText('Startseite');
    });
  }
}
