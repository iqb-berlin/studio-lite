import { TranslateService } from '@ngx-translate/core';
import { type GateTextsOverride, WIDGET_TEXT_NAMES } from '@iqb/gate-angular';

/**
 * The texts of the gateway's dialogs (`@iqb/gate-angular`) -- the challenge, and the notice that the
 * gateway refused a request -- from the studio's translations under `human-verification.*`, asked
 * for whenever a dialog opens, so that they are loaded by then. A text without a translation is
 * left out, and the library's own takes its place: `instant` would answer with the key itself.
 */
export function gateTextsFrom(translate: TranslateService): GateTextsOverride {
  const text = (key: string): string | undefined => {
    const fullKey = `human-verification.${key}`;
    const translated: string = translate.instant(fullKey);
    return translated === fullKey ? undefined : translated;
  };
  return {
    title: text('title'),
    intro: text('intro'),
    failed: text('failed'),
    loadFailed: text('load-failed'),
    reloadNeeded: text('reload-needed'),
    retry: text('retry'),
    cancel: text('cancel'),
    refusalTitle: text('refusal-title'),
    automationDetected: text('automation-detected'),
    notVerified: text('not-verified'),
    close: text('close'),
    widget: Object.fromEntries(WIDGET_TEXT_NAMES.map(name => [name, text(`widget.${name}`)]))
  };
}
