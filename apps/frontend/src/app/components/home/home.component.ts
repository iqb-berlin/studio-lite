import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';

import { BackendService } from '../../services/backend.service';
import { AppService } from '../../services/app.service';
import { AppConfig } from '../../classes/app-config.class';
import { AppInfoComponent } from '../app-info/app-info.component';
import { UserReviewsAreaComponent } from '../user-reviews-area/user-reviews-area.component';
import { UserWorkspacesAreaComponent } from '../user-workspaces-area/user-workspaces-area.component';
import { LoginComponent } from '../login/login.component';
import { AuthCheckFailedComponent } from '../auth-check-failed/auth-check-failed.component';

/**
 * The start page: the login for whoever is not logged in, and for whoever is, the workspaces and
 * reviews they can reach. Both live on the same page, so a login does not need a route of its own.
 * A stored login the server could not check gets a second attempt instead of the login form.
 */
@Component({
  selector: 'studio-lite-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    LoginComponent, AuthCheckFailedComponent, UserWorkspacesAreaComponent, UserReviewsAreaComponent, AppInfoComponent
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  constructor(
    public appService: AppService,
    private backendService: BackendService,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.backendService.getConfig()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(newConfig => {
          if (newConfig) {
            this.appService.appConfig = new AppConfig(this.titleService, newConfig, this.sanitizer);
            this.appService.dataLoading = false;
            this.appService.globalWarning = this.appService.appConfig.globalWarningText();
          }
        });
      this.appService.appConfig.setPageTitle(this.translateService.instant('home.welcome'));
      this.appService.dataLoading = false;
      const token = localStorage.getItem('id_token');
      if (token) {
        this.backendService.getAuthData()
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe({
            next: authData => {
              this.appService.authData = authData;
            },
            // Whether a stored login could not be checked is decided by the start alone (#2112).
            // Here the user may be logged in already, and the interceptor shows the failure.
            error: () => {}
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
