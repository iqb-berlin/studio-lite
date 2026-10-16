import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

/**
 * The codes of the player specification (plugin-player, "Fehlercodes") that the dialog explains,
 * each reached by the codes players send for it. Older aspect players are still in use and send
 * kebab-case, the oldest `audio-timeout` instead of `media-timeout`, so these get the same text.
 */
const SPEC_CODES: ReadonlyMap<string, string> = new Map([
  ['GEOGEBRA_NOT_LOADING', 'GEOGEBRA_NOT_LOADING'],
  ['geogebra-not-loading', 'GEOGEBRA_NOT_LOADING'],
  ['GEOGEBRA_TIMEOUT', 'GEOGEBRA_TIMEOUT'],
  ['geometry-timeout', 'GEOGEBRA_TIMEOUT'],
  ['IMAGE_NOT_LOADING', 'IMAGE_NOT_LOADING'],
  ['image-not-loading', 'IMAGE_NOT_LOADING'],
  ['MEDIA_TIMEOUT', 'MEDIA_TIMEOUT'],
  ['media-timeout', 'MEDIA_TIMEOUT'],
  ['audio-timeout', 'MEDIA_TIMEOUT'],
  ['MEDIA_DURATION_ERROR', 'MEDIA_DURATION_ERROR'],
  ['media-duration-error', 'MEDIA_DURATION_ERROR']
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
  readonly isKnownCode: boolean;
  readonly explanationKey: string;

  constructor(
    public dialogRef: MatDialogRef<VopRuntimeErrorNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sessionId?: string, code?: string, message?: string }
  ) {
    this.sessionId = data.sessionId;
    this.code = data.code;
    this.message = data.message;
    const specCode = this.code ? SPEC_CODES.get(this.code) : undefined;
    this.isKnownCode = !!specCode;
    this.explanationKey = specCode ? `runtime-error-dialog.codes.${specCode}` : 'runtime-error-dialog.message';
  }
}
