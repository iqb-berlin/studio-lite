import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { RequestReportDto } from '@studio-lite-lib/api-dto';

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>
        <mat-icon>{{messageType}}</mat-icon>
        {{ ('dialogs.request-report-source.' + messageData.source) | translate }}
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
    </div>
  `,
  styles: ['mat-dialog-content { padding-bottom: 30px;}']
})
export class RequestMessageDialogComponent {
  messageType: 'error' | 'warning' | 'info' = 'info';
  messageData: RequestReportDto;
  constructor(@Inject(MAT_DIALOG_DATA) public data: unknown) {
    this.messageData = data as RequestReportDto;
    if (this.messageData) {
      this.messageData.messages.forEach(m => {
        if (m.messageKey.indexOf('warn') >= 0) this.messageType = 'warning';
      });
      this.messageData.messages.forEach(m => {
        if (m.messageKey.indexOf('error') >= 0) this.messageType = 'error';
      });
    }
  }
}
