import { Component, OnInit } from '@angular/core';

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
  // eslint-disable-next-line class-methods-use-this
  ngOnInit(): void {
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.log('yoyo');
    });
  }
}