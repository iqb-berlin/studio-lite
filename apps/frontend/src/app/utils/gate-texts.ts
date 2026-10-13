import { TranslateService } from '@ngx-translate/core';
import { type GateTextsOverride, WIDGET_TEXT_NAMES } from '@iqb/gate-angular';

/**
 * The texts of the gateway's challenge dialog (`@iqb/gate-angular`), from the studio's
 * translations under `human-verification.*` -- asked for whenever the dialog opens, so that they
 * are loaded by then. A text without a translation is left out, and the library's own takes its
 * place: `instant` would answer with the key itself.
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
    retry: text('retry'),
    cancel: text('cancel'),
    widget: Object.fromEntries(WIDGET_TEXT_NAMES.map(name => [name, text(`widget.${name}`)]))
  };
}
