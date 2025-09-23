import { Injectable } from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { Router } from '@angular/router';
import { lastValueFrom, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ModuleService } from '../../shared/services/module.service';
import { UnitData } from '../models/unit-data.class';
import { ReviewBackendService } from './review-backend.service';
import { AppService } from '../../../services/app.service';
import { Comment } from '../../comments/models/comment.interface';
import { I18nService } from '../../../services/i18n.service';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  reviewId = 0;
  reviewName = '';
  reviewCreatedAt: string = '';
  reviewChangedAt: string = '';
  workspaceId = 0;
  workspaceName = '';
  units: UnitData[] = [];
  reviewConfig: ReviewConfigDto = {};
  bookletConfig: BookletConfigDto = {};
  screenHeaderText = '';
  pageHeaderText = '';
  currentUnitSequenceId = -1;
  unitInfoPanelWidth = 300;
  unitInfoPanelOn = false;
  allComments: Comment[] = [];

  get unitDbId(): number {
    const unitData = this.units.filter(u => u.sequenceId === this.currentUnitSequenceId);
    return unitData && unitData.length > 0 ? unitData[0].databaseId : 0;
  }

  constructor(
    private translateService: TranslateService,
    private moduleService: ModuleService,
    private backendService: ReviewBackendService,
    public appService: AppService,
    private router: Router,
    private i18nService: I18nService
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
        this.screenHeaderText = this.translateService
          .instant('review.booklet', { name: this.reviewName });
      } else if (this.bookletConfig.unitScreenHeader === 'WITH_BLOCK_TITLE') {
        this.screenHeaderText = this.translateService
          .instant('review.block', { name: this.reviewName });
      } else {
        this.screenHeaderText = '';
      }
    } else {
      this.screenHeaderText = '';
    }
  }

  updateCommentsUnitInfo(unitId:number) {
    this.backendService.getUnitComments(
      this.reviewId, unitId
    ).subscribe(unitComments => {
      this.allComments = unitComments;
    });
  }

  toDateTimeString(date: Date): string {
    const datePipe = new DatePipe(this.i18nService.fullLocale);
    return datePipe.transform(new Date(date), this.i18nService.dateTimeFormat) || '';
  }

  async loadReviewData(): Promise<void> {
    return lastValueFrom(this.backendService.getReview(this.reviewId).pipe(
      tap(reviewData => {
        this.appService.appConfig.setPageTitle(
          this.translateService.instant('review.header'),
          true);
        if (reviewData) {
          this.reviewName = reviewData.name ? reviewData.name : '?';
          this.workspaceName = reviewData.workspaceName && reviewData.workspaceGroupName ?
            this.translateService
              .instant('review.info', {
                workspace: reviewData.workspaceName, workspaceGroup: reviewData.workspaceGroupName
              }) : '';
          this.workspaceId = reviewData.workspaceId ? reviewData.workspaceId : 0;
          this.reviewCreatedAt = reviewData.createdAt ? this.toDateTimeString(reviewData.createdAt) : '';
          this.reviewChangedAt = reviewData.changedAt ? this.toDateTimeString(reviewData.changedAt) : '';
          if (reviewData.units) {
            let counter = 0;
            reviewData.units.forEach(u => {
              this.units.push({
                databaseId: u,
                sequenceId: counter,
                name: this.translateService.instant('review.unit', { index: counter + 1 }),
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
