import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { ConfigDto } from '@studio-lite-lib/api-dto';

export class AppConfig {
  readonly appTitle: string;
  pageTitle: string;
  hideTitlesOnPage = false;
  readonly introHtml: SafeUrl | undefined;
  readonly imprintHtml: SafeUrl | undefined;
  readonly emailText: string;
  private readonly _globalWarningText: string;
  private readonly _globalWarningExpiredDay: Date | undefined;
  private readonly _globalWarningExpiredHour: number | undefined;
  private readonly titleService: Title;
  readonly hasUsers: boolean;

  constructor(titleService: Title, appConfig?: ConfigDto, sanitizer?: DomSanitizer) {
    this.appTitle = appConfig ? appConfig.appTitle : 'IQB-Studio';
    this.pageTitle = '';
    if (appConfig && appConfig.introHtml && sanitizer) {
      this.introHtml = sanitizer.bypassSecurityTrustHtml(appConfig.introHtml);
    }
    if (appConfig && appConfig.imprintHtml && sanitizer) {
      this.imprintHtml = sanitizer.bypassSecurityTrustHtml(appConfig.imprintHtml);
    }
    this.emailText = appConfig ? appConfig.emailText : '';
    this._globalWarningText = appConfig ? appConfig.globalWarningText : '';
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

  setPageTitle(newPageTitel: string, hide = false): void {
    this.pageTitle = newPageTitel;
    this.hideTitlesOnPage = hide;
    this.titleService.setTitle(`${this.appTitle} | ${this.pageTitle}`);
  }
}
