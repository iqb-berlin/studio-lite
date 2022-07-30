import { Component, OnInit } from '@angular/core';
import { ReviewService } from '../review.service';

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
      this.reviewService.currentUnitSequenceId = -1;
      this.reviewService.setHeaderText('Startseite');
    });
  }
}
