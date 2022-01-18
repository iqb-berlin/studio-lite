import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';

export enum MessageType {
  error,
  warning,
  info
}

@Component({
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.css']
})
export class MessageDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public msgdata: MessageDialogData) { }

  ngOnInit(): void {
    if ((typeof this.msgdata.title === 'undefined') || (this.msgdata.title.length === 0)) {
      switch (this.msgdata.type) {
        case MessageType.error: {
          this.msgdata.title = 'Achtung: Fehler';
          break;
        }
        case MessageType.warning: {
          this.msgdata.title = 'Achtung: Warnung';
          break;
        }
        default: {
          this.msgdata.title = 'Hinweis';
          break;
        }
      }
    }
    if ((typeof this.msgdata.closebuttonlabel === 'undefined') || (this.msgdata.closebuttonlabel.length === 0)) {
      this.msgdata.closebuttonlabel = 'Schließen';
    }
  }
}

export interface MessageDialogData {
  type: MessageType;
  title: string;
  content: string;
  closebuttonlabel: string;
}
