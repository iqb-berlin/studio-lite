import { inject, Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { LanguageService } from './language.service';
import { splitLanguagePrefix } from '../utils/language-prefix.utils';

/**
 * Keeps the language prefix (`#/en/…`) out of the router's sight (#2174).
 *
 * Every url the router reads loses a prefix of an offered language, and every url it writes gets
 * the prefix of the active one -- none for German, so its addresses stay as they were. The routes,
 * every `routerLink` and `navigate` and the guards therefore know nothing of languages, and a url
 * the router hands out (`serializeUrl` for the print window, `state.url` for the way back after the
 * login) carries the language with it.
 */
@Injectable()
export class LanguageUrlSerializer extends DefaultUrlSerializer {
  private languageService = inject(LanguageService);

  override parse(url: string): UrlTree {
    return super.parse(splitLanguagePrefix(url, this.languageService.codes).rest);
  }

  override serialize(tree: UrlTree): string {
    return `${this.languageService.prefix}${super.serialize(tree)}`;
  }
}
