import { Subject } from 'rxjs';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { AuthDataDto, AppLogoDto, ConfigDto } from '@studio-lite-lib/api-dto';
import { Title } from '@angular/platform-browser';
import { AppHttpError } from '../models/app-http-error.class';
import { AppConfig } from '../models/app-config.class';

export const standardLogo: AppLogoDto = {
  data: 'assets/studio-logo-144.png',
  bodyBackground: '#7fafb1',
  boxBackground: '#eeeeee'
};
export const defaultAppConfig = <ConfigDto>{
  appTitle: 'IQB-Studio',
  introHtml: '<p>nicht definiert</p>',
  imprintHtml: '<p>nicht definiert</p>',
  emailSubject: '',
  emailBody: '',
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
    userLongName: '',
    isAdmin: false,
    workspaces: [],
    reviews: []
  };

  private _authData = AppService.defaultAuthData;
  isLoggedInKeycloak = false;
  appConfig: AppConfig;
  appLogo: AppLogoDto | null = null;
  errorMessages: AppHttpError[] = [];
  errorMessageCounter = 0;
  errorMessagesDisabled = false;
  globalWarning = '';
  postMessage$ = new Subject<MessageEvent>();
  dataLoading: boolean | number = false;
  @Output() authDataChanged = new EventEmitter<AuthDataDto>();

  set authData(authData: AuthDataDto) {
    this._authData = authData;
    this.authDataChanged.emit(authData);
  }

  get authData(): AuthDataDto {
    return this._authData;
  }

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
