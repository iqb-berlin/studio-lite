import {DomSanitizer, SafeUrl, Title} from "@angular/platform-browser";
import {ConfigFullDto} from "@studio-lite-lib/api-dto";

export interface WorkspaceDataFlat {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  selected: boolean;
}

export class AppConfig {
  readonly appTitle: string;
  pageTitle: string;
  readonly introHtml: SafeUrl | undefined;
  readonly imprintHtml: SafeUrl | undefined;
  private readonly _globalWarningText: string;
  private readonly _globalWarningExpiredDay: Date | undefined;
  private readonly _globalWarningExpiredHour: number | undefined;
  private readonly titleService: Title;

  constructor(titleService: Title, appConfig?: ConfigFullDto, sanitizer?: DomSanitizer) {
    this.appTitle = appConfig ? appConfig.appTitle : 'IQB-Studio-Lite';
    this.pageTitle = '';
    if (appConfig && appConfig.introHtml && sanitizer) this.introHtml = sanitizer.bypassSecurityTrustHtml(appConfig.introHtml);
    if (appConfig && appConfig.imprintHtml && sanitizer) this.imprintHtml = sanitizer.bypassSecurityTrustHtml(appConfig.imprintHtml);
    this._globalWarningText = appConfig ? appConfig.globalWarningText : '';
    this._globalWarningExpiredDay = appConfig ? appConfig.globalWarningExpiredDay : undefined;
    this._globalWarningExpiredHour = appConfig ? appConfig.globalWarningExpiredHour : undefined;
    this.titleService = titleService
  }

  public static isExpired(checkDate: Date | undefined, checkHour: number | undefined): boolean {
    if (checkDate) {
      const calcTimePoint = new Date(checkDate);
      calcTimePoint.setHours(calcTimePoint.getHours() + Number(checkHour ? checkHour : 0));
      const now = new Date(Date.now());
      return calcTimePoint < now;
    }
    return false
  }

  public globalWarningText(): string {
    return this._globalWarningText && this._globalWarningExpiredDay &&
    AppConfig.isExpired(this._globalWarningExpiredDay, this._globalWarningExpiredHour) ? '' : this._globalWarningText;
  }

  public setPageTitle(newPageTitel: string): void {
    this.pageTitle = newPageTitel;
    this.titleService.setTitle(`${this.appTitle} | ${this.pageTitle}`);
  }
}
