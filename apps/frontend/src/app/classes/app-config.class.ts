import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { ConfigDto } from '@studio-lite-lib/api-dto';
import { DEFAULT_UI_LANGUAGE, textIn } from '@studio-lite/shared-code';

/**
 * How the installation presents itself: its name, the intro and imprint texts, the address a
 * contact mail goes to, and the warning that can be shown to everyone until a given day and hour.
 *
 * The HTML texts are configured by an administrator, so they pass the sanitizer once here rather
 * than at each place they are rendered.
 *
 * An administrator writes the texts once per language; each comes in the language of the interface,
 * or in German where it has none in that language (#2186).
 */
export class AppConfig {
  readonly appTitle: string;
  pageTitle: string;
  hideTitlesOnPage = false;
  readonly introHtml: SafeUrl | undefined;
  readonly imprintHtml: SafeUrl | undefined;
  readonly emailSubject: string;
  readonly emailBody: string;
  private readonly _globalWarningText: string;
  private readonly _globalWarningExpiredDay: Date | undefined;
  private readonly _globalWarningExpiredHour: number | undefined;
  private readonly titleService: Title;
  readonly hasUsers: boolean;

  constructor(
    titleService: Title,
    appConfig?: ConfigDto,
    sanitizer?: DomSanitizer,
    language: string = DEFAULT_UI_LANGUAGE
  ) {
    this.appTitle = appConfig ? textIn(appConfig.appTitle, language) : 'IQB-Studio';
    this.pageTitle = '';
    const introHtml = textIn(appConfig?.introHtml, language);
    if (introHtml && sanitizer) {
      this.introHtml = sanitizer.bypassSecurityTrustHtml(introHtml);
    }
    const imprintHtml = textIn(appConfig?.imprintHtml, language);
    if (imprintHtml && sanitizer) {
      this.imprintHtml = sanitizer.bypassSecurityTrustHtml(imprintHtml);
    }
    this.emailSubject = appConfig ? appConfig.emailSubject : '';
    this.emailBody = appConfig ? appConfig.emailBody : '';
    this._globalWarningText = textIn(appConfig?.globalWarningText, language);
    this._globalWarningExpiredDay = appConfig ? appConfig.globalWarningExpiredDay : undefined;
    this._globalWarningExpiredHour = appConfig ? appConfig.globalWarningExpiredHour : undefined;
    this.hasUsers = appConfig ? appConfig.hasUsers : true;
    this.titleService = titleService;
  }

  static isExpired(checkDate: Date | undefined, checkHour: number | undefined): boolean {
    if (checkDate) {
      const calcTimePoint = new Date(checkDate);
      calcTimePoint.setHours(calcTimePoint.getHours() + Number(checkHour || 0));
      const now = new Date(Date.now());
      return calcTimePoint < now;
    }
    return false;
  }

  globalWarningText(): string {
    return this._globalWarningText && this._globalWarningExpiredDay &&
    AppConfig.isExpired(this._globalWarningExpiredDay, this._globalWarningExpiredHour) ? '' : this._globalWarningText;
  }

  setPageTitle(newPageTitle: string, hide = false): void {
    this.pageTitle = newPageTitle;
    this.hideTitlesOnPage = hide;
    this.titleService.setTitle(`${this.appTitle} | ${this.pageTitle}`);
  }
}
