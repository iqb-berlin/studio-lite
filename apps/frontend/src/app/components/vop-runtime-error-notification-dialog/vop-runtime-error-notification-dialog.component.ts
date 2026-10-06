import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

/**
 * The codes the aspect player reports, each with the text that explains it to an author.
 * `audio-timeout` is what older players send for a medium that did not load in time, newer ones
 * send `media-timeout` -- both are still in use, so both get the same text.
 */
const EXPLANATION_KEYS: ReadonlyMap<string, string> = new Map([
  ['geogebra-not-loading', 'runtime-error-dialog.codes.geogebra-not-loading'],
  ['geometry-timeout', 'runtime-error-dialog.codes.geometry-timeout'],
  ['image-not-loading', 'runtime-error-dialog.codes.image-not-loading'],
  ['media-timeout', 'runtime-error-dialog.codes.media-timeout'],
  ['audio-timeout', 'runtime-error-dialog.codes.media-timeout'],
  ['media-duration-error', 'runtime-error-dialog.codes.media-duration-error']
]);

/**
 * Shows a runtime error the player has reported. For a code it knows, the dialog explains what
 * is wrong and what to do, and keeps the player's own message below as a technical detail; for
 * any other code it only says that the player has reported an error.
 */
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
  isKnownCode: boolean;
  explanationKey: string;

  constructor(
    public dialogRef: MatDialogRef<VopRuntimeErrorNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sessionId?: string, code?: string, message?: string }
  ) {
    this.sessionId = data.sessionId;
    this.code = data.code;
    this.message = data.message;
    const explanationKey = this.code ? EXPLANATION_KEYS.get(this.code) : undefined;
    this.isKnownCode = !!explanationKey;
    this.explanationKey = explanationKey ?? 'runtime-error-dialog.message';
  }
}
