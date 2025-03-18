import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { RequestReportDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'studio-lite-request-message',
    templateUrl: './request-message.component.html',
    styleUrls: ['./request-message.component.scss'],
    // eslint-disable-next-line max-len
    imports: [MatDialogTitle, MatIcon, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})
export class RequestMessageComponent {
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
