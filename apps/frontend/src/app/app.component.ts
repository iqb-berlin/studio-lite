import { Component, OnInit } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { MainDatastoreService } from './maindatastore.service';
import { BackendService } from './backend.service';

@Component({
  selector: 'studio-lite-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  constructor(
    public mds: MainDatastoreService,
    private bs: BackendService,
    private sanitizer: DomSanitizer,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.mds.dataLoading = true;
      this.bs.getConfig().subscribe(newConfig => {
        if (newConfig) {
          newConfig.trusted_intro_html = this.sanitizer.bypassSecurityTrustHtml(newConfig.intro_html);
          if (newConfig.impressum_html) {
            newConfig.trusted_impressum_html = this.sanitizer.bypassSecurityTrustHtml(newConfig.impressum_html);
          }
          if (!newConfig.app_title) newConfig.app_title = 'IQB-Teststudio';
          this.mds.appConfig = newConfig;
          this.titleService.setTitle(this.mds.appConfig.app_title);
          this.mds.dataLoading = false;
          if (this.mds.appConfig.global_warning) {
            if (!MainDatastoreService.warningIsExpired(this.mds.appConfig)) {
              this.mds.globalWarning = this.mds.appConfig.global_warning;
            }
          }
        }
      });
      this.bs.getStatus().subscribe(newStatus => {
        this.mds.loginStatus = newStatus;
      },
      () => {
        this.mds.loginStatus = null;
      });

      window.addEventListener('message', event => {
        this.mds.processMessagePost(event);
      }, false);
    });
  }
}
