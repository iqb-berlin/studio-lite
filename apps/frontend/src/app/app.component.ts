import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Router, RouterState } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { de } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
import { AppService, standardLogo } from './services/app.service';
import { BackendService } from './services/backend.service';
import { AppConfig } from './app.classes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  constructor(
    public appService: AppService,
    private backendService: BackendService,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService,
    private titleService: Title,
    private router: Router
  ) {
    setDefaultOptions({ locale: de });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.dataLoading = true;
      this.backendService.getConfig().subscribe(newConfig => {
        if (newConfig) {
          this.appService.appConfig = new AppConfig(this.titleService, newConfig, this.sanitizer);
          this.titleService.setTitle(this.appService.appConfig.appTitle);
          this.appService.dataLoading = false;
          this.appService.globalWarning = this.appService.appConfig.globalWarningText();
        }
      });
      this.backendService.getAppLogo().subscribe(newLogo => {
        this.appService.appLogo = standardLogo;
        if (newLogo) {
          if (newLogo.data && newLogo.data.length > 0) this.appService.appLogo.data = newLogo.data;
          if (newLogo.bodyBackground && newLogo.bodyBackground.length > 0) {
            this.appService.appLogo.bodyBackground = newLogo.bodyBackground;
          }
          if (newLogo.boxBackground && newLogo.boxBackground.length > 0) {
            this.appService.appLogo.boxBackground = newLogo.boxBackground;
          }
        }
        if (this.appService.appLogo.bodyBackground) {
          document.documentElement.style.setProperty('--st-body-background', this.appService.appLogo.bodyBackground);
        }
        if (this.appService.appLogo.boxBackground) {
          document.documentElement.style.setProperty('--st-box-background', this.appService.appLogo.boxBackground);
        }
      });
      const token = localStorage.getItem('id_token');
      if (token) {
        this.backendService.getAuthData().subscribe(authData => {
          this.appService.authData = authData;
        });
      }

      registerLocaleData(localeDe);

      window.addEventListener('message', event => {
        this.appService.processMessagePost(event);
      }, false);
    });
  }

  dataLoadingIsNumber() {
    return typeof this.appService.dataLoading === 'number';
  }

  dataLoadingAsText() {
    if (typeof this.appService.dataLoading === 'number') {
      const progressValue = this.appService.dataLoading as number;
      if (progressValue <= 100) return `${progressValue} %`;
      if (progressValue < 8000) return `${(progressValue / 1024).toFixed(1)} kB`;
      return `${(progressValue / 1048576).toFixed(1)} MB`;
    }
    return this.translateService.instant('application.wait-message');
  }

  logout_from_error() {
    const state: RouterState = this.router.routerState;
    const { snapshot } = state;
    const snapshotUrl = (snapshot.url === '/') ? '' : snapshot.url;
    this.backendService.logout();
    this.appService.clearErrorMessages();
    this.router.navigate(['/'], { queryParams: { redirectTo: snapshotUrl } });
  }
}
