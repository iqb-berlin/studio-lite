import { Component } from '@angular/core';

@Component({
  template: `
    <div fxLayout="column" fxLayoutAlign="start stretch" class="admin-tab-content">
      <div fxLayout="row" class="div-row">
        <div fxFlex="30">
          <mat-label>Texte</mat-label>
        </div>
        <div fxFlex="70">
          <app-app-config></app-app-config>
        </div>
      </div>
      <div fxLayout="row" class="div-row">
        <div fxFlex="30">
          <mat-label>Logo und Farben</mat-label>
        </div>
        <div fxFlex="70">
          <studio-lite-app-logo></studio-lite-app-logo>
        </div>
      </div>
      <div fxLayout="row" class="div-row">
        <div fxFlex="30">
          <mat-label>Parameter für den Unit-Export</mat-label>
        </div>
        <div fxFlex="70">
          <app-unit-export-config></app-unit-export-config>
        </div>
      </div>
    </div>
  `,
  styles: ['.div-row {border-color: gray; border-width: 0 0 1px 0; border-style: solid; margin-top: 10px}']
})
export class SettingsComponent {}
