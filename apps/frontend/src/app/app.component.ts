import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { AppService, standardLogo } from './app.service';
import { BackendService } from './backend.service';
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
    private titleService: Title
  ) {}

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
        this.appService.appLogo = newLogo || standardLogo;
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

      window.addEventListener('message', event => {
        this.appService.processMessagePost(event);
      }, false);
    });
  }
}
