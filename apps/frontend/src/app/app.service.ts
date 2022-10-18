import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthDataDto, AppLogoDto, ConfigDto } from '@studio-lite-lib/api-dto';
import { Title } from '@angular/platform-browser';
import { AppConfig, AppHttpError } from './app.classes';

export const standardLogo: AppLogoDto = {
  data: 'assets/IQB-LogoA.png',
  alt: 'Zur Startseite',
  // eslint-disable-next-line max-len
  bodyBackground: 'linear-gradient(180deg, rgba(7,70,94,1) 0%, rgba(6,112,123,1) 24%, rgba(1,192,229,1) 85%)',
  boxBackground: 'lightgray'
};
export const defaultAppConfig = <ConfigDto>{
  appTitle: 'IQB-Studio',
  introHtml: '<p>nicht definiert</p>',
  imprintHtml: '<p>nicht definiert</p>',
  globalWarningText: '',
  globalWarningExpiredHour: 0,
  globalWarningExpiredDay: new Date(),
  hasUsers: true
};

@Injectable({
  providedIn: 'root'
})
export class AppService {
  static defaultAuthData = <AuthDataDto>{
    userId: 0,
    userName: '',
    isAdmin: false,
    workspaces: [],
    reviews: []
  };

  authData = AppService.defaultAuthData;
  appConfig: AppConfig;
  appLogo: AppLogoDto | null = null;
  errorMessages: AppHttpError[] = [];
  errorMessageCounter = 0;
  errorMessagesDisabled = false;
  globalWarning = '';
  postMessage$ = new Subject<MessageEvent>();
  dataLoading: boolean | number = false;

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

  isWorkspaceGroupAdmin(workspaceId: number): boolean {
    let myReturn = false;
    this.authData.workspaces.forEach(wsGroup => {
      wsGroup.workspaces.forEach(ws => {
        if (ws.id === workspaceId) myReturn = wsGroup.isAdmin;
      });
    });
    return myReturn;
  }

  addErrorMessage(error: AppHttpError) {
    if (!this.errorMessagesDisabled) {
      const alikeErrors = this.errorMessages.filter(e => e.status === error.status);
      if (alikeErrors.length > 0) {
        alikeErrors[0].message += `; ${error.message}`;
      } else {
        this.errorMessageCounter += 1;
        error.id = this.errorMessageCounter;
        this.errorMessages.push(error);
      }
    }
  }

  removeErrorMessage(error: AppHttpError) {
    for (let i = 0; i < this.errorMessages.length; i++) {
      if (this.errorMessages[i].id === error.id) {
        this.errorMessages.splice(i, 1);
      }
    }
  }

  clearErrorMessages() {
    this.errorMessages = [];
  }
}
