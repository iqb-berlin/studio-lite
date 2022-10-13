import { Component, Inject, OnInit } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  template: `
    <div class="page-body">
      <div fxLayout="row" fxLayoutAlign="center start">
        <mat-card fxFlex="0 2 500px" class="single-box">
          <mat-card-title>{{appService.appConfig.appTitle}} - {{appService.appConfig.pageTitle}}</mat-card-title>
          <mat-card-content>
            <div [innerHTML]="appService.appConfig.imprintHtml"></div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button [routerLink]="['/']">{{'home.home-page' | translate}}</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: ['div.intro-main {margin: 40px; max-width: 600px;}',
  '.single-box {background: var(--st-box-background)}']
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
