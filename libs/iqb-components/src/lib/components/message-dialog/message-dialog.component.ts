import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

/** Which icon the dialog wears; the template compares against the numbers behind these names. */
export enum MessageType {
  error,
  warning,
  info
}

/**
 * A dialog that only says something -- error, warning or notice, with the matching icon and a single
 * button to close it. {@link ConfirmDialogComponent} is the one that asks.
 */
@Component({
  selector: 'iqb-message-dialog',
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

/** What {@link MessageDialogComponent} is opened with; title and button label have defaults per type. */
export interface MessageDialogData {
  type: MessageType;
  title: string;
  content: string;
  closeButtonLabel: string;
}
