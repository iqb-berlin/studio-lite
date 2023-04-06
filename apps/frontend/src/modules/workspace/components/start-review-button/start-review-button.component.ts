import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-start-review-button',
  templateUrl: './start-review-button.component.html',
  styleUrls: ['./start-review-button.component.scss']
})
export class StartReviewButtonComponent {
  @Input() selectedReviewId!: number;
  @Input() unitCount!: number;
  locationOrigin!: string;
  constructor() {
    this.locationOrigin = window.location.origin;
  }
}
