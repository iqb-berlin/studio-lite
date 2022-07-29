import { Injectable } from '@angular/core';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';
import { Router } from '@angular/router';
import { UnitData } from './classes/unit-data.class';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  reviewId = 0;
  reviewName = '';
  units: UnitData[] = [];
  reviewSettings?: ReviewSettingsDto;
  currentPageHeader = '';
  currentUnitSequenceId = -1;

  constructor(
    private router: Router
  ) {}

  setUnitNavigationRequest(targetUnitId: number) {
    if (targetUnitId < 0) {
      this.router.navigate([`/review/${this.reviewId}/start`]);
    } else if (targetUnitId >= this.units.length) {
      this.router.navigate([`/review/${this.reviewId}/end`]);
    } else {
      this.router.navigate([`/review/${this.reviewId}/u/${targetUnitId}`]);
    }
  }
}
