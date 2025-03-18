import { Component, Inject, OnInit } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { MatAnchor } from '@angular/material/button';
import {
  MatCard, MatCardTitle, MatCardContent, MatCardActions
} from '@angular/material/card';
import { AppService } from '../../services/app.service';

@Component({
    selector: 'studio-lite-about',
    templateUrl: './about.component.html',
    styleUrls: ['about.component.scss'],
    imports: [MatCard, MatCardTitle, MatCardContent, MatCardActions, MatAnchor, RouterLink, TranslateModule]
})

export class AboutComponent implements OnInit {
  constructor(
    @Inject('APP_NAME') public appName: string,
    @Inject('APP_PUBLISHER') public appPublisher: string,
    @Inject('APP_VERSION') public appVersion: string,
    public appService: AppService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.appConfig
        .setPageTitle(
          this.translateService.instant('home.imprint')
        );
    });
  }
}
