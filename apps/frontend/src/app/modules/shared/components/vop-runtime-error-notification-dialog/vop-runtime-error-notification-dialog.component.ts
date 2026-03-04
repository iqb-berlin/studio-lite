import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'studio-lite-vop-runtime-error-notification-dialog',
  templateUrl: './vop-runtime-error-notification-dialog.component.html',
  styleUrls: ['./vop-runtime-error-notification-dialog.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslateModule],
  standalone: true
})
export class VopRuntimeErrorNotificationDialogComponent {
  sessionId?: string;
  code?: string;
  message?: string;

  constructor(
    public dialogRef: MatDialogRef<VopRuntimeErrorNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sessionId?: string, code?: string, message?: string }
  ) {
    this.sessionId = data.sessionId;
    this.code = data.code;
    this.message = data.message;
  }
}
