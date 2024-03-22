import {
  Component, Input, ViewChild
} from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { ReviewService } from '../../services/review.service';
import { Comment } from '../../../comments/models/comment.interface';
import { UnitInfoLoaderComponent } from '../unit-info-loader/unit-info-loader.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
    selector: 'studio-lite-unit-info-comments',
    templateUrl: './unit-info-comments.component.html',
    styleUrls: ['./unit-info-comments.component.scss'],
    standalone: true,
    imports: [UnitInfoLoaderComponent, NgIf, NgFor, MatIcon, DatePipe, TranslateModule]
})
export class UnitInfoCommentsComponent {
  @ViewChild(UnitInfoLoaderComponent) loader?: UnitInfoLoaderComponent;
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  _unitId = 0;
  _allComments: Comment[] = [];
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
    this.updateContent();
  }

  @Input('allComments')
  set allComments(value: Comment[]) {
    this._allComments = value;
  }

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
      } else {
        this.loader.spinnerOn = true;
        this.backendService.getUnitComments(
          this.reviewService.reviewId, unitData.databaseId
        ).subscribe(unitComments => {
          if (this.loader) this.loader.spinnerOn = false;
          unitData.comments = UnitInfoCommentsComponent.sortComments(unitComments);
          this.allComments = unitData.comments;
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
