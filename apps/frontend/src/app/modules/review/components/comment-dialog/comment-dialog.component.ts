import {
  MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { Subject, takeUntil } from 'rxjs';
import { CommentsComponent } from '../../../comments/components/comments/comments.component';
import { AppService } from '../../../../services/app.service';
import { ReviewService } from '../../services/review.service';
import { ReviewBackendService } from '../../services/review-backend.service';
import { SortAscendingPipe } from '../../../comments/pipes/sort-ascending.pipe';

const NAME_LOCAL_STORAGE_KEY = 'iqb-studio-user-name-for-review-comments';

@Component({
  selector: 'studio-lite-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, MatFormField, MatLabel, MatInput, FormsModule, MatDialogContent, CommentsComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule, CdkDrag, CdkDragHandle]
})
export class CommentDialogComponent implements OnInit, OnDestroy {
  userName = '';
  unitItems: UnitItemDto[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private backendService: ReviewBackendService,
    public reviewService: ReviewService,
    public appService: AppService,
    public dialogRef: MatDialogRef<CommentDialogComponent>
  ) { }

  ngOnInit() {
    if (this.appService.authData.userId === 0) {
      this.userName = localStorage.getItem(NAME_LOCAL_STORAGE_KEY) || '';
    } else {
      this.userName = this.appService.authData.userLongName || this.appService.authData.userName;
    }
    this.backendService
      .getUnitItems(this.reviewService.reviewId, this.reviewService.unitDbId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(items => this.setUnitItems(items));
  }

  private setUnitItems(items: UnitItemDto[]) {
    this.unitItems = items
      .sort((a, b) => SortAscendingPipe
        .sortAscending(a, b, 'id'));
  }

  parametersValid() {
    return (this.appService.authData.userLongName || this.appService.authData.userName || this.userName) &&
      this.reviewService.unitDbId;
  }

  close() {
    if (!this.reviewService.reviewConfig.showOthersComments) this.dialogRef.close();
  }

  storeUserName() {
    localStorage.setItem(NAME_LOCAL_STORAGE_KEY, this.userName);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
