import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { WsgAdminService } from '../wsg-admin.service';

@Component({
  template: `
    <div fxLayout="column" fxLayoutAlign="start stretch" class="admin-tab-content">
      <div fxLayout="row" class="div-row">
        <div fxFlex="30">
          <mat-label>Texte</mat-label>
        </div>
        <div fxFlex="70">
          <p>config 1</p>
        </div>
      </div>
      <div fxLayout="row" class="div-row">
        <div fxFlex="30">
          <mat-label>Logo und Farben</mat-label>
        </div>
        <div fxFlex="70">
          <p>config 2</p>
        </div>
      </div>
      <div fxLayout="row" class="div-row">
        <div fxFlex="30">
          <mat-label>Parameter für den Unit-Export</mat-label>
        </div>
        <div fxFlex="70">
          <p>config 3</p>
        </div>
      </div>
    </div>
  `,
  styles: ['.div-row {border-color: gray; border-width: 0 0 1px 0; border-style: solid; margin-top: 10px}']
})
export class SettingsComponent implements OnInit {
  constructor(
    private appService: AppService,
    private wsgAdminService: WsgAdminService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.appService.appConfig.setPageTitle(
        `Verwaltung "${this.wsgAdminService.selectedWorkspaceGroupName}": Einstellungen`
      );
    });
  }
}
