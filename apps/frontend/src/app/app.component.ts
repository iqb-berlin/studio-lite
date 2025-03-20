import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  Router, RouterState, RouterLink, RouterOutlet
} from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { de } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AppService, standardLogo } from './services/app.service';
import { BackendService } from './services/backend.service';
import { AppConfig } from './models/app-config.class';
import { IsInArrayPipe } from './pipes/is-in-array.pipe';
import { DataLoadingAsTextPipe } from './pipes/data-loading-as-text.pipe';
import { DataLoadingIsNumberPipe } from './pipes/data-loading-is-number.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatProgressSpinner, MatButton, MatTooltip, MatIcon, RouterLink, RouterOutlet, TranslateModule, DataLoadingIsNumberPipe, DataLoadingAsTextPipe, IsInArrayPipe]
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
    this.translateService.use('de');
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

  logout_from_error() {
    const state: RouterState = this.router.routerState;
    const { snapshot } = state;
    const snapshotUrl = (snapshot.url === '/') ? '' : snapshot.url;
    this.backendService.logout();
    this.appService.clearErrorMessages();
    this.router.navigate(['/'], { queryParams: { redirectTo: snapshotUrl } });
  }
}
