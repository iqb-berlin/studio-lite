import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

export enum MessageType {
  error,
  warning,
  info
}

@Component({
  template: `
    <h1 mat-dialog-title>
      <mat-icon *ngIf="messageData.type === 0">error</mat-icon>
      <mat-icon *ngIf="messageData.type === 1">warning</mat-icon>
      <mat-icon *ngIf="messageData.type === 2">info</mat-icon>
      {{ messageData.title }}
    </h1>
    <mat-dialog-content>
      {{ messageData.content }}
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-raised-button [mat-dialog-close]="false">{{ messageData.closeButtonLabel }}</button>
    </mat-dialog-actions>
  `,
  styles: ['mat-dialog-content { padding-bottom: 30px;}']
})
export class MessageDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public messageData: MessageDialogData) { }

  ngOnInit(): void {
    if ((typeof this.messageData.title === 'undefined') || (this.messageData.title.length === 0)) {
      switch (this.messageData.type) {
        case MessageType.error: {
          this.messageData.title = 'Achtung: Fehler';
          break;
        }
        case MessageType.warning: {
          this.messageData.title = 'Achtung: Warnung';
          break;
        }
        default: {
          this.messageData.title = 'Hinweis';
          break;
        }
      }
    }
    if ((typeof this.messageData.closeButtonLabel === 'undefined') ||
      (this.messageData.closeButtonLabel.length === 0)) {
      this.messageData.closeButtonLabel = 'Schließen';
    }
  }
}

export interface MessageDialogData {
  type: MessageType;
  title: string;
  content: string;
  closeButtonLabel: string;
}
