import {
  MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { NgIf } from '@angular/common';
import { CommentsComponent } from '../../../comments/components/comments/comments.component';
import { AppService } from '../../../../services/app.service';
import { ReviewService } from '../../services/review.service';

const NAME_LOCAL_STORAGE_KEY = 'iqb-studio-user-name-for-review-comments';

@Component({
  selector: 'studio-lite-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, NgIf, MatFormField, MatLabel, MatInput, FormsModule, MatDialogContent, CommentsComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class CommentDialogComponent implements OnInit {
  userName = '';

  constructor(
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
}
