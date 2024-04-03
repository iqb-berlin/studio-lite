import {
  Component, Inject, OnInit
} from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { BackendService } from '../../services/backend.service';
import { AppService } from '../../services/app.service';
import { AppConfig } from '../../models/app-config.class';
import { AppInfoComponent } from '../app-info/app-info.component';
import { UserReviewsAreaComponent } from '../user-reviews-area/user-reviews-area.component';
import { UserWorkspacesAreaComponent } from '../user-workspaces-area/user-workspaces-area.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'studio-lite-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [LoginComponent, UserWorkspacesAreaComponent, UserReviewsAreaComponent, AppInfoComponent]
})
export class HomeComponent implements OnInit {
  constructor(
    @Inject('APP_VERSION') readonly appVersion: string,
    @Inject('APP_NAME') readonly appName: string,
    public appService: AppService,
    private backendService: BackendService,
    private titleService: Title,
    private sanitizer: DomSanitizer,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.backendService.getConfig().subscribe(newConfig => {
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
        this.backendService.getAuthData().subscribe(authData => {
          this.appService.authData = authData;
        });
      }
    });
  }
}
