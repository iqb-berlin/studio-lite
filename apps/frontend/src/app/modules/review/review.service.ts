import { Injectable } from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { Router } from '@angular/router';
import { ModuleService } from '@studio-lite/studio-components';
import { lastValueFrom, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { UnitData } from './models/unit-data.class';
import { BackendService } from './backend.service';
import { AppService } from '../../services/app.service';

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
  unitInfoPanelWidth = 300;
  unitInfoPanelOn = false;

  get unitDbId(): number {
    const unitData = this.units.filter(u => u.sequenceId === this.currentUnitSequenceId);
    return unitData && unitData.length > 0 ? unitData[0].databaseId : 0;
  }

  constructor(
    private moduleService: ModuleService,
    private backendService: BackendService,
    public appService: AppService,
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

  async loadReviewData(): Promise<void> {
    return lastValueFrom(this.backendService.getReview(this.reviewId).pipe(
      tap(reviewData => {
        this.appService.appConfig.setPageTitle('Review', true);
        if (reviewData) {
          this.reviewName = reviewData.name ? reviewData.name : '?';
          this.workspaceName = reviewData.workspaceName ? reviewData.workspaceName : '?';
          this.workspaceId = reviewData.workspaceId ? reviewData.workspaceId : 0;
          this.units = [];
          if (reviewData.units) {
            let counter = 0;
            reviewData.units.forEach(u => {
              this.units.push({
                databaseId: u,
                sequenceId: counter,
                name: `Aufgabe ${(counter + 1).toString()}`,
                definition: '',
                playerId: '',
                responses: ''
              });
              counter += 1;
            });
          }
          this.reviewConfig = reviewData.settings && reviewData.settings.reviewConfig ?
            reviewData.settings.reviewConfig : {};
          this.bookletConfig = reviewData.settings && reviewData.settings.bookletConfig ?
            reviewData.settings.bookletConfig : {};
        }
      }),
      tap(() => this.moduleService.loadList()),
      map(() => {}))
    );
  }
}
