import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { RequestReportDto } from '@studio-lite-lib/api-dto';

@Component({
  template: `
    <h1 mat-dialog-title>
      <mat-icon>{{messageType}}</mat-icon>
      {{ ('dialogs.close.request-report-source.' + messageData.source) | translate }}
    </h1>
    <mat-dialog-content>
      <ul>
        <li *ngFor="let m of messageData.messages">
          <strong>{{m.objectKey}}</strong>: {{m.messageKey | translate}}
        </li>
      </ul>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="false">{{ 'dialogs.close' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: ['mat-dialog-content { padding-bottom: 30px;}']
})
export class RequestMessageDialogComponent {
  messageType: 'error' | 'warning' | 'info' = 'info';
  constructor(@Inject(MAT_DIALOG_DATA) public messageData: RequestReportDto) {
    if (messageData) {
      messageData.messages.forEach(m => {
        if (m.messageKey.indexOf('warn') >= 0) this.messageType = 'warning';
      });
      messageData.messages.forEach(m => {
        if (m.messageKey.indexOf('error') >= 0) this.messageType = 'error';
      });
    }
  }
}
