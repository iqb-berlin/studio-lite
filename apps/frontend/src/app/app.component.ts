import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { MainDatastoreService } from './maindatastore.service';
import {AppConfig, BackendService} from './backend.service';
import {AuthService} from "./auth.service";

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  constructor(
    public mds: MainDatastoreService,
    private bs: BackendService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.mds.dataLoading = true;
      this.bs.getConfig().subscribe(newConfig => {
        if (newConfig) {
          this.mds.appConfig = new AppConfig(newConfig, this.sanitizer);
          this.titleService.setTitle(this.mds.appConfig.appTitle);
          this.mds.dataLoading = false;
          this.mds.globalWarning = this.mds.appConfig.globalWarningText();
        }
      });
      const token = localStorage.getItem('id_token');
      if (token) {
        this.authService.getAuthData().subscribe(authData => {
          this.authService.authData = authData
        })
      }

      window.addEventListener('message', event => {
        this.mds.processMessagePost(event);
      }, false);
    });
  }
}
