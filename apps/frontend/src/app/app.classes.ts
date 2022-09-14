// eslint-disable-next-line max-classes-per-file
import { DomSanitizer, SafeUrl, Title } from '@angular/platform-browser';
import { ConfigDto } from '@studio-lite-lib/api-dto';
import { HttpErrorResponse } from '@angular/common/http';

export interface WorkspaceDataFlat {
  id: number;
  name: string;
  groupId: number;
  groupName: string;
  selected: boolean;
}

export class AppHttpError {
  status: number;
  message: string;
  method = '';
  urlWithParams = '';
  id = 0;
  constructor(errorObj: HttpErrorResponse) {
    this.status = errorObj.error instanceof ErrorEvent ? 999 : errorObj.status;
    this.message = errorObj.error instanceof ErrorEvent ? (<ErrorEvent>errorObj.error).message : errorObj.message;
  }
}

export class AppConfig {
  readonly appTitle: string;
  pageTitle: string;
  hideTitlesOnPage = false;
  readonly introHtml: SafeUrl | undefined;
  readonly imprintHtml: SafeUrl | undefined;
  private readonly _globalWarningText: string;
  private readonly _globalWarningExpiredDay: Date | undefined;
  private readonly _globalWarningExpiredHour: number | undefined;
  private readonly titleService: Title;

  constructor(titleService: Title, appConfig?: ConfigDto, sanitizer?: DomSanitizer) {
    this.appTitle = appConfig ? appConfig.appTitle : 'IQB-Studio-Lite';
    this.pageTitle = '';
    if (appConfig && appConfig.introHtml && sanitizer) {
      this.introHtml = sanitizer.bypassSecurityTrustHtml(appConfig.introHtml);
    }
    if (appConfig && appConfig.imprintHtml && sanitizer) {
      this.imprintHtml = sanitizer.bypassSecurityTrustHtml(appConfig.imprintHtml);
    }
    this._globalWarningText = appConfig ? appConfig.globalWarningText : '';
    this._globalWarningExpiredDay = appConfig ? appConfig.globalWarningExpiredDay : undefined;
    this._globalWarningExpiredHour = appConfig ? appConfig.globalWarningExpiredHour : undefined;
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
