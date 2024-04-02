import { MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


export enum MessageType {
  error,
  warning,
  info
}

@Component({
    template: `
    <h1 mat-dialog-title>
      @if (messageData.type === 0) {
        <mat-icon>error</mat-icon>
      }
      @if (messageData.type === 1) {
        <mat-icon>warning</mat-icon>
      }
      @if (messageData.type === 2) {
        <mat-icon>info</mat-icon>
      }
      {{ messageData.title }}
    </h1>
    <mat-dialog-content>
      {{ messageData.content }}
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button [mat-dialog-close]="false">{{ messageData.closeButtonLabel }}</button>
    </mat-dialog-actions>
    `,
    styles: ['mat-dialog-content { padding-bottom: 30px;}'],
    standalone: true,
    imports: [MatDialogTitle, MatIcon, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
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
