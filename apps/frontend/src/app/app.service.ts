import { Subject} from 'rxjs';
import { Injectable } from '@angular/core';
import {AuthDataDto} from "@studio-lite-lib/api-dto";
import {Title} from "@angular/platform-browser";
import {AppConfig} from "./app.classes";

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
  errorMessage = '';
  globalWarning = '';
  postMessage$ = new Subject<MessageEvent>();
  dataLoading = false;

  constructor(
    private titleService: Title
  ) {
    this.appConfig = new AppConfig(this.titleService)
  }

  processMessagePost(postData: MessageEvent): void {
    const msgData = postData.data;
    const msgType = msgData.type;
    if ((typeof msgType !== 'undefined') && (msgType !== null)) {
      this.postMessage$.next(postData);
    }
  }
}
