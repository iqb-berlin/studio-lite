import {
  Component, Input
} from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';

const bookletConfigDefault = {
  pagingMode: '',
  pageNaviButtons: '',
  unitNaviButtons: '',
  controllerDesign: '',
  unitScreenHeader: '',
  unitTitle: ''
};

@Component({
  selector: 'booklet-config-show',
  template: `
    <div fxLayout="column" class="booklet-config">
      <div fxLayout="row" fxLayoutAlign="start center" *ngIf="bookletConfig.pagingMode">
        <div fxFlex="45%">{{'booklet-config.pagingMode.label' | translate}}</div>
        <div fxFlex>{{'booklet-config.pagingMode.' + bookletConfig.pagingMode | translate}}</div>
      </div>
      <div fxLayout="row" fxLayoutAlign="start center" *ngIf="bookletConfig.pageNaviButtons">
        <div fxFlex="45%">{{'booklet-config.pageNaviButtons.label' | translate}}</div>
        <div fxFlex>{{'booklet-config.pageNaviButtons.' + bookletConfig.pageNaviButtons | translate}}</div>
      </div>
      <div fxLayout="row" fxLayoutAlign="start center" *ngIf="bookletConfig.unitNaviButtons">
        <div fxFlex="45%">{{'booklet-config.unitNaviButtons.label' | translate}}</div>
        <div fxFlex>{{'booklet-config.unitNaviButtons.' + bookletConfig.unitNaviButtons | translate}}</div>
      </div>
      <div fxLayout="row" fxLayoutAlign="start center" *ngIf="bookletConfig.controllerDesign">
        <div fxFlex="45%">{{'booklet-config.controllerDesign.label' | translate}}</div>
        <div fxFlex>{{'booklet-config.controllerDesign.' + bookletConfig.controllerDesign | translate}}</div>
      </div>
      <div fxLayout="row" fxLayoutAlign="start center" *ngIf="bookletConfig.unitScreenHeader">
        <div fxFlex="45%">{{'booklet-config.unitScreenHeader.label' | translate}}</div>
        <div fxFlex>{{'booklet-config.unitScreenHeader.' + bookletConfig.unitScreenHeader | translate}}</div>
      </div>
      <div fxLayout="row" fxLayoutAlign="start center" *ngIf="bookletConfig.unitTitle">
        <div fxFlex="45%">{{'booklet-config.unitTitle.label' | translate}}</div>
        <div fxFlex>{{'booklet-config.unitTitle.' + bookletConfig.unitTitle | translate}}</div>
      </div>
    </div>
  `,
  styles: [
    '.booklet-config > div { margin: 1px 0; background-color: whitesmoke; padding: 4px }',
    '.booklet-config { background-color: lightgray; padding: 2px }'
  ]
})
export class BookletConfigShowComponent {
  bookletConfig: BookletConfigDto = bookletConfigDefault;
  @Input('config')
  set config(value: BookletConfigDto | undefined) {
    this.bookletConfig = value || bookletConfigDefault;
  }
}
