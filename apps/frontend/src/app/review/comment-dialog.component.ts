import { MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { ReviewService } from './review.service';
import { AppService } from '../app.service';

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>Kommentieren</h1>
      <mat-dialog-content fxFlex>
        <studio-lite-comments *ngIf="parametersValid()"
                              [style.height.%]="100"
                              [userName]="this.appService.authData.userLongName || this.appService.authData.userName"
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
export class CommentDialogComponent {
  constructor(
    public reviewService: ReviewService,
    public appService: AppService,
    public dialogRef: MatDialogRef<CommentDialogComponent>
  ) {}

  parametersValid() {
    return (this.appService.authData.userLongName || this.appService.authData.userName) &&
      this.reviewService.unitDbId;
  }

  close() {
    if (!this.reviewService.reviewConfig.showOthersComments) this.dialogRef.close();
  }
}
