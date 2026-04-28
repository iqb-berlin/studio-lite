import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  Router, RouterState, RouterLink, RouterOutlet, NavigationEnd
} from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';
import { AppService, standardLogo } from './services/app.service';
import { BackendService } from './services/backend.service';
import { AppConfig } from './classes/app-config.class';
import { IsInArrayPipe } from './pipes/is-in-array.pipe';
import { DataLoadingAsTextPipe } from './pipes/data-loading-as-text.pipe';
import { DataLoadingIsNumberPipe } from './pipes/data-loading-is-number.pipe';
import { I18nService } from './services/i18n.service';
import { UserMenuComponent } from './components/user-menu/user-menu.component';
import { WrappedIconComponent } from './components/wrapped-icon/wrapped-icon.component';
import { HeartbeatService } from './services/heartbeat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatProgressSpinner, MatButton, MatTooltip, MatIcon, RouterLink, RouterOutlet, TranslateModule, DataLoadingIsNumberPipe, DataLoadingAsTextPipe, IsInArrayPipe, UserMenuComponent, WrappedIconComponent, AsyncPipe]
})

export class AppComponent implements OnInit {
  private heartbeatService = inject(HeartbeatService);
  appService = inject(AppService);
  private backendService = inject(BackendService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private router = inject(Router);
  private i18nService = inject(I18nService);

  currentRoutePath = ''; // home, about, print, admin, a , wsg-admin, review
  activityStatus$ = this.heartbeatService.activityStatus$;

  constructor() {
    this.i18nService.setLocale();
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const urlParts = event.urlAfterRedirects.split(/[/?]/);
        this.currentRoutePath = (urlParts.length > 1) ? urlParts[1] : '';
      }
    });
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
          if (authData.userId) this.heartbeatService.start();
        });
      }
      window.addEventListener('message', event => {
        this.appService.processMessagePost(event);
      }, false);
    });
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
