import { MatDialogRef } from '@angular/material/dialog';
import { Component, OnInit } from '@angular/core';
import { ReviewService } from './review.service';
import { AppService } from '../app.service';

const NAME_LOCAL_STORAGE_KEY = 'iqb-studio-user-name-for-review-comments';

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <div fxLayout="row" fxLayoutAlign="space-between center">
        <h1 mat-dialog-title>Kommentieren</h1>
        <mat-form-field *ngIf="this.appService.authData.userId === 0">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="userName" placeholder="Bitte Namen eingeben"
                 (ngModelChange)="storeUserName()">
        </mat-form-field>
      </div>
      <mat-dialog-content fxFlex>
        <studio-lite-comments *ngIf="parametersValid()"
                              [style.height.%]="100"
                              [userName]="userName"
                              [userId]="this.appService.authData.userId"
                              [unitId]="this.reviewService.unitDbId"
                              [workspaceId]="0"
                              [newCommentOnly]="!reviewService.reviewConfig.showOthersComments"
                              [reviewId]="this.reviewService.reviewId"
                              (onCommentsUpdated)="close()">
        </studio-lite-comments>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button [mat-dialog-close]="false">
          {{'dialogs.close' | translate }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: ['.mat-dialog-content {max-height: 100vH}']
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
