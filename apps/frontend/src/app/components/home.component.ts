import {
  Component, Inject, OnInit
} from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { BackendService } from '../services/backend.service';
import { AppService } from '../services/app.service';
import { AppConfig } from '../classes/app-config.class';

@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(@Inject('APP_VERSION') readonly appVersion: string,
              @Inject('APP_NAME') readonly appName: string,
              public appService: AppService,
              private backendService: BackendService,
              private titleService: Title,
              private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.backendService.getConfig().subscribe(newConfig => {
        if (newConfig) {
          this.appService.appConfig = new AppConfig(this.titleService, newConfig, this.sanitizer);
          this.appService.dataLoading = false;
          this.appService.globalWarning = this.appService.appConfig.globalWarningText();
        }
      });
      this.appService.appConfig.setPageTitle('Willkommen!');
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
