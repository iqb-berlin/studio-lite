import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { ReviewService } from './review.service';
import { AppService } from '../app.service';

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>Kommentieren</h1>
      <mat-dialog-content fxFlex>
        <studio-lite-comments *ngIf="userName && unitId && reviewId"
                              [style.height.%]="100"
                              [userName]="userName"
                              [userId]="userId"
                              [unitId]="unitId"
                              [workspaceId]="0"
                              [reviewId]="reviewId">
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
  userName: string = '';
  userId: number = 0;
  unitId: number = 0;
  reviewId: number = 0;

  constructor(
    private reviewService: ReviewService,
    public appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: unknown
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.unitId = this.reviewService.unitDbId;
      this.reviewId = this.reviewService.reviewId;
      this.userId = this.appService.authData.userId;
      this.userName = this.appService.authData.userLongName || this.appService.authData.userName;
    });
  }
}
