import { Injectable } from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { Router } from '@angular/router';
import { UnitData } from './classes/unit-data.class';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  reviewId = 0;
  reviewName = '';
  workspaceId = 0;
  workspaceName = '';
  units: UnitData[] = [];
  reviewConfig: ReviewConfigDto = {};
  bookletConfig: BookletConfigDto = {};
  screenHeaderText = 'Startseite';
  pageHeaderText = 'Startseite';
  currentUnitSequenceId = -1;

  get unitDbId(): number {
    const unitData = this.units.filter(u => u.sequenceId === this.currentUnitSequenceId);
    return unitData && unitData.length > 0 ? unitData[0].databaseId : 0;
  }

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

  setHeaderText(pageName: string) {
    this.pageHeaderText = pageName;
    if (this.bookletConfig) {
      if (this.bookletConfig.unitScreenHeader === 'WITH_UNIT_TITLE') {
        this.screenHeaderText = pageName;
      } else if (this.bookletConfig.unitScreenHeader === 'WITH_BOOKLET_TITLE') {
        this.screenHeaderText = `Review '${this.reviewName}' (Testheft)`;
      } else if (this.bookletConfig.unitScreenHeader === 'WITH_BLOCK_TITLE') {
        this.screenHeaderText = `Review '${this.reviewName}' (Block)`;
      } else {
        this.screenHeaderText = '';
      }
    } else {
      this.screenHeaderText = '';
    }
  }
}
