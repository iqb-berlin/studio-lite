import {
  Component, Input, ViewChild
} from '@angular/core';
import { BackendService } from '../../backend.service';
import { ReviewService } from '../../review.service';
import { Comment } from '../../../comments/types/comment';
import { UnitInfoLoaderComponent } from './unit-info-loader.component';

@Component({
  selector: 'unit-info-comments',
  template: `
    <div fxLayout="column" [style.minHeight.px]="minHeight">
      <div class="unit-info-comment-header">Kommentare</div>
      <unit-info-loader (onEnter)="updateContent()"></unit-info-loader>
      <div *ngIf="allComments.length === 0">{{ loader?.spinnerOn ? 'lade...' : 'Keine Kommentare verfügbar.'}}</div>
      <div class="unit-info-comment-content" *ngFor="let c of allComments">
        <div fxLayout="row" fxLayoutAlign="space-between">
            <h4><mat-icon *ngIf="c.parentId">subdirectory_arrow_right</mat-icon>{{c.userName}}</h4>
            <p>{{c.changedAt | date : 'dd.MM.yyyy' : timeZone}}</p>
        </div>
        <div [innerHTML]="c.body" [class]="c.parentId ? 'reply-comment' : ''"></div>
      </div>
    </div>
  `,
  styles: [
    `.unit-info-comment-header {
      align-content: stretch;
      background-color: rgba(87,247,147,0.32);
      font-size: large;
      padding: 2px 6px;
    }`,
    `.unit-info-comment-content {
      border-top: 1px solid darkgray;
    }`,
    `.reply-comment {
      margin-left: 20px;
    }`,
    `.unit-info-comment-content h4 {
      margin-top: 2px;
    }`
  ]
})
export class UnitInfoCommentsComponent {
  @ViewChild(UnitInfoLoaderComponent) loader?: UnitInfoLoaderComponent;
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  minHeight = 1000;
  _unitId = 0;
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
    this.minHeight = 1000;
    this.updateContent();
  }

  allComments: Comment[] = [];

  constructor(
    private backendService: BackendService,
    public reviewService: ReviewService
  ) {}

  updateContent() {
    this.allComments = [];
    if (this.reviewService.units[this._unitId] && this.loader && this.loader.isInView) {
      const unitData = this.reviewService.units[this._unitId];
      if (unitData.comments && unitData.comments.length > 0) {
        this.allComments = unitData.comments;
        this.minHeight = 0;
      } else {
        this.loader.spinnerOn = true;
        this.backendService.getUnitComments(
          this.reviewService.reviewId, unitData.databaseId
        ).subscribe(unitComments => {
          if (this.loader) this.loader.spinnerOn = false;
          unitData.comments = UnitInfoCommentsComponent.sortComments(unitComments);
          this.allComments = unitData.comments;
          this.minHeight = 0;
        });
      }
    }
  }

  static sortComments(sourceComments: Comment[]): Comment[] {
    const firstLevelComments = sourceComments.filter(c => !c.parentId);
    let returnComments: Comment[] = [];
    firstLevelComments.forEach(c => {
      returnComments = [...returnComments, c, ...sourceComments.filter(cChild => cChild.parentId === c.id)];
    });
    return returnComments;
  }
}
