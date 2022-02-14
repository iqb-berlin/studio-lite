import { Component, Inject, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  template: `
    <div class="page-body">
      <div fxLayout="row" fxLayoutAlign="center start">
        <mat-card fxFlex="0 2 500px">
          <mat-card-title>{{appService.appConfig?.appTitle}} - {{appService.appConfig?.pageTitle}}</mat-card-title>
          <mat-card-content>
            <div [innerHTML]="appService.appConfig?.imprintHtml"></div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="foreground" [routerLink]="['/']">Startseite</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: ['div.intro-main {margin: 40px; max-width: 600px;}']
})

export class AboutComponent implements OnInit {
  constructor(
    @Inject('APP_NAME') public appName: string,
    @Inject('APP_PUBLISHER') public appPublisher: string,
    @Inject('APP_VERSION') public appVersion: string,
    public appService: AppService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.appConfig.setPageTitle('Impressum/Datenschutz');
    });
  }
}
