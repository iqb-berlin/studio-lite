import {DomSanitizer, SafeUrl, Title} from "@angular/platform-browser";
import {ConfigDto} from "@studio-lite-lib/api-dto";
import {HttpErrorResponse} from "@angular/common/http";

export interface WorkspaceDataFlat {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  selected: boolean;
}

export class AppHttpError {
  code: number | undefined;
  info: string | undefined;
  constructor(errorObj?: HttpErrorResponse) {
    if (errorObj) {
      this.code = errorObj.status;
      this.info = errorObj.message;
      if (errorObj.status === 401) {
        this.info = 'Zugriff verweigert - bitte (neu) anmelden!';
      } else if (errorObj.status === 503) {
        this.info = 'Server meldet Datenbankproblem.';
      } else if (errorObj.error instanceof ErrorEvent) {
        this.info = `Fehler: ${(<ErrorEvent>errorObj.error).message}`;
      }
    }
  }

  msg(): string {
    return `${this.info} (Fehler ${this.code})`;
  }
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

  constructor(titleService: Title, appConfig?: ConfigDto, sanitizer?: DomSanitizer) {
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
