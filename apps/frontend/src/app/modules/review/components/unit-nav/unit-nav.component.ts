import { Component } from '@angular/core';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'studio-lite-unit-nav',
  templateUrl: './unit-nav.component.html',
  styleUrls: ['./unit-nav.component.scss']
})
export class UnitNavComponent {
  constructor(public reviewService: ReviewService) {}
}
