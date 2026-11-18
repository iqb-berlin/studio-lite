import { DOCUMENT } from '@angular/common';
import {
  inject, Injectable, InjectionToken, Injector
} from '@angular/core';
import { firstValueFrom, from, isObservable } from 'rxjs';
import { DEFAULT_UI_LANGUAGE, UI_LANGUAGES, UiLanguage } from '@studio-lite/shared-code';
import { languageOfHash, splitLanguagePrefix } from '../utils/language-prefix.utils';

/** The languages the interface is offered in; tests give their own list. */
export const OFFERED_UI_LANGUAGES = new InjectionToken<readonly UiLanguage[]>('OFFERED_UI_LANGUAGES', {
  providedIn: 'root',
  factory: () => UI_LANGUAGES
});

/**
 * The language the interface runs in, and the way to another one.
 *
 * The page is loaded in the language its address names -- `#/en/…` is English, an address without a
 * prefix German, so every link from before languages existed opens as it did (#2174). Formats,
 * Angular's locale data and the date picker are set up at start and cannot follow a later change,
 * so another language is a reload of the page under the new prefix, chosen in the language menu.
 * An address that turns up later in another language -- back, forward, the address bar -- does not
 * reload: the router goes there with its guards, as for any address, and writes it in the active
 * language. A reload there would pass by the question about unsaved changes that leaving a unit asks.
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private document = inject(DOCUMENT);
  private injector = inject(Injector);
  readonly languages = inject(OFFERED_UI_LANGUAGES);
  readonly codes: readonly string[] = this.languages.map(language => language.code);
  readonly active: UiLanguage = languageOfHash(this.window.location.hash, this.languages);
  /** The prefix of a router url in the active language: `/en` in English, nothing in German. */
  readonly prefix = LanguageService.prefixOf(this.active.code);

  private static prefixOf(code: string): string {
    return code === DEFAULT_UI_LANGUAGE ? '' : `/${code}`;
  }

  /** The start page in the active language, as a page address. */
  homeHref(): string {
    return `/#${this.prefix}/home`;
  }

  /**
   * Reloads the current page in another language, once unsaved changes to a unit are saved or
   * dropped -- the question leaving the unit asks. That question is the workspace's guard, loaded
   * only now: imported, it would sit in the bundle every page loads at start. Without it, nothing
   * is reloaded, so no change can be lost unasked.
   */
  async switchTo(code: string): Promise<void> {
    if (code === this.active.code || !this.codes.includes(code)) return;
    if (!await this.mayLeaveUnit()) return;
    const { rest } = splitLanguagePrefix(this.window.location.hash.replace(/^#/, ''), this.codes);
    this.reloadAt(`#${LanguageService.prefixOf(code)}${rest || '/'}`);
  }

  /**
   * Loads the page anew at the given address. The address is replaced first: assigned instead, an
   * address that differs only in the hash would not load the page at all, and one that differs in
   * the path would race the reload.
   */
  reloadAt(href: string): void {
    this.window.history.replaceState(null, '', href);
    this.window.location.reload();
  }

  private async mayLeaveUnit(): Promise<boolean> {
    let guardModule: typeof import('../modules/workspace/guards/unit-routing.guard');
    try {
      guardModule = await import('../modules/workspace/guards/unit-routing.guard');
    } catch (error) {
      // Typically the chunk of an older release, gone after an update while the page was open.
      // eslint-disable-next-line no-console
      console.error('The check for unsaved changes could not be loaded; the language stays.', error);
      return false;
    }
    const mayLeave = this.injector.get(guardModule.UnitRoutingCanDeactivateGuard).canDeactivate();
    return await firstValueFrom(isObservable(mayLeave) ? mayLeave : from(Promise.resolve(mayLeave))) === true;
  }

  private get window(): Window {
    return this.document.defaultView as Window;
  }
}
