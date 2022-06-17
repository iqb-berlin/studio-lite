import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthDataDto, AppLogoDto, ConfigDto } from '@studio-lite-lib/api-dto';
import { Title } from '@angular/platform-browser';
import { AppConfig } from './app.classes';

export const standardLogo: AppLogoDto = {
  data: 'assets/IQB-LogoA.png',
  alt: 'Zur Startseite',
  bodyBackground: 'linear-gradient(180deg, rgba(7,70,94,1) 0%, rgba(6,112,123,1) 24%, rgba(1,192,229,1) 85%, rgba(1,201,241,1) 92%, rgba(237,178,255,1) 100%)',
  boxBackground: 'lightgray'
};
export const defaultAppConfig = <ConfigDto>{
  appTitle: 'IQB-Teststudio',
  introHtml: '<p>nicht definiert</p>',
  imprintHtml: '<p>nicht definiert</p>',
  globalWarningText: '',
  globalWarningExpiredHour: 0,
  globalWarningExpiredDay: new Date()
};

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public static defaultAuthData = <AuthDataDto>{
    userId: 0,
    userName: 'unbekannt',
    isAdmin: false,
    workspaces: []
  }

  authData = AppService.defaultAuthData;
  appConfig: AppConfig;
  appLogo: AppLogoDto | null = null;
  errorMessage = '';
  globalWarning = '';
  postMessage$ = new Subject<MessageEvent>();
  dataLoading = false;

  constructor(
    private titleService: Title
  ) {
    this.appConfig = new AppConfig(this.titleService);
  }

  processMessagePost(postData: MessageEvent): void {
    const msgData = postData.data;
    const msgType = msgData.type;
    if ((typeof msgType !== 'undefined') && (msgType !== null)) {
      this.postMessage$.next(postData);
    }
  }
}
