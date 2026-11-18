import { DOCUMENT } from '@angular/common';
import {
  inject, Injectable, InjectionToken, OnDestroy
} from '@angular/core';
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
 * The address decides it, and nothing else: `#/en/…` is English, an address without a prefix is
 * German, so every link from before languages existed opens as it did (#2174). It is read once at
 * start. Formats, Angular's locale data and the date picker are set up then and cannot follow a
 * later change, so another language is a reload of the page under the new prefix -- whether it was
 * chosen in the menu or typed into the address bar.
 */
@Injectable({
  providedIn: 'root'
})
export class LanguageService implements OnDestroy {
  private document = inject(DOCUMENT);
  readonly languages = inject(OFFERED_UI_LANGUAGES);
  readonly codes: readonly string[] = this.languages.map(language => language.code);
  readonly active: UiLanguage = languageOfHash(this.window.location.hash, this.languages);

  private readonly reloadOnForeignLanguage = (): void => {
    if (languageOfHash(this.window.location.hash, this.languages).code !== this.active.code) {
      this.window.location.reload();
    }
  };

  constructor() {
    // Only the browser fires these: the address bar, back and forward. The router's own navigations
    // go through pushState and replaceState and change nothing here.
    this.window.addEventListener('popstate', this.reloadOnForeignLanguage);
    this.window.addEventListener('hashchange', this.reloadOnForeignLanguage);
  }

  ngOnDestroy(): void {
    this.window.removeEventListener('popstate', this.reloadOnForeignLanguage);
    this.window.removeEventListener('hashchange', this.reloadOnForeignLanguage);
  }

  /** The prefix of a router url in the active language: `/en` in English, nothing in German. */
  get prefix(): string {
    return this.active.code === DEFAULT_UI_LANGUAGE ? '' : `/${this.active.code}`;
  }

  /** The start page in the active language, as a page address. */
  homeHref(): string {
    return `/#${this.prefix}/home`;
  }

  /** Reloads the current page in another language. */
  switchTo(code: string): void {
    if (code === this.active.code || !this.codes.includes(code)) return;
    const { rest } = splitLanguagePrefix(this.window.location.hash.replace(/^#/, ''), this.codes);
    const prefix = code === DEFAULT_UI_LANGUAGE ? '' : `/${code}`;
    this.window.history.replaceState(null, '', `#${prefix}${rest || '/'}`);
    this.window.location.reload();
  }

  private get window(): Window {
    return this.document.defaultView as Window;
  }
}
