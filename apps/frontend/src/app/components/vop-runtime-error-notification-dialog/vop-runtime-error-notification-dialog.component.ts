import {
  Component, computed, Inject, signal
} from '@angular/core';
import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogRef
} from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { VopRuntimeErrorNotification } from '../../models/verona.interface';

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

/** A runtime error as the player reports it. */
export type RuntimeError = Partial<Pick<VopRuntimeErrorNotification, 'sessionId' | 'code' | 'message'>>;

/** The runtime errors that share one explanation, in the order they arrived. */
export interface RuntimeErrorGroup {
  explanationKey: string;
  isKnownCode: boolean;
  runtimeErrors: readonly RuntimeError[];
}

/**
 * Shows the runtime errors the player reports. For a code it knows, the dialog explains what is
 * wrong and what to do, and keeps the player's own message below as a technical detail; for any
 * other code it only says that the player has reported an error.
 *
 * A player reports every element that fails on its own, and each message names its element. So
 * one dialog takes all the errors that arrive while it is open: each explanation is shown once,
 * with the errors it covers below it, and an error already shown is not added again (#1869).
 */
@Component({
  selector: 'studio-lite-vop-runtime-error-notification-dialog',
  templateUrl: './vop-runtime-error-notification-dialog.component.html',
  styleUrls: ['./vop-runtime-error-notification-dialog.component.scss'],
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslateModule],
  standalone: true
})
export class VopRuntimeErrorNotificationDialogComponent {
  readonly sessionId?: string;
  private readonly runtimeErrors = signal<RuntimeError[]>([]);

  readonly groups = computed((): RuntimeErrorGroup[] => {
    const groups = new Map<string, RuntimeErrorGroup>();
    this.runtimeErrors().forEach(runtimeError => {
      const specCode = runtimeError.code ? SPEC_CODES.get(runtimeError.code) : undefined;
      const explanationKey = specCode ? `runtime-error-dialog.codes.${specCode}` : 'runtime-error-dialog.message';
      const group = groups.get(explanationKey);
      groups.set(explanationKey, {
        explanationKey,
        isKnownCode: !!specCode,
        runtimeErrors: [...(group?.runtimeErrors ?? []), runtimeError]
      });
    });
    return [...groups.values()];
  });

  constructor(
    public dialogRef: MatDialogRef<VopRuntimeErrorNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RuntimeError
  ) {
    this.sessionId = data.sessionId;
    this.add(data);
  }

  /** Adds a runtime error the player reports while the dialog is open, unless it is already shown. */
  add(runtimeError: RuntimeError): void {
    this.runtimeErrors.update(runtimeErrors => (
      runtimeErrors.some(shown => shown.code === runtimeError.code && shown.message === runtimeError.message) ?
        runtimeErrors :
        [...runtimeErrors, runtimeError]
    ));
  }
}
