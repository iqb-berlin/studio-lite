import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ReviewSettingsDto } from '@studio-lite-lib/api-dto';

const bookletConfigDefault = {
  pagingMode: '',
  pageNaviButtons: '',
  unitNaviButtons: '',
  controllerDesign: '',
  unitScreenHeader: '',
  unitTitle: ''
};

@Component({
  selector: 'booklet-config-edit',
  template: `
    <dix fxLayout="column">
      <mat-form-field>
        <mat-select [placeholder]="'booklet-config.pagingMode.label' | translate"
                    (selectionChange)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="bookletConfig.pagingMode">
          <mat-option *ngFor="let c of pagingModeOptions" [value]="c">
            {{'booklet-config.pagingMode.' + c | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select [placeholder]="'booklet-config.pageNaviButtons.label' | translate"
                    (selectionChange)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="bookletConfig.pageNaviButtons">
          <mat-option *ngFor="let c of pageNaviButtonsOptions" [value]="c">
            {{'booklet-config.pageNaviButtons.' + c | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select [placeholder]="'booklet-config.unitNaviButtons.label' | translate"
                    (selectionChange)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="bookletConfig.unitNaviButtons">
          <mat-option *ngFor="let c of unitNaviButtonsOptions" [value]="c">
            {{'booklet-config.unitNaviButtons.' + c | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select [placeholder]="'booklet-config.controllerDesign.label' | translate"
                    (selectionChange)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="bookletConfig.controllerDesign">
          <mat-option *ngFor="let c of controllerDesignOptions" [value]="c">
            {{'booklet-config.controllerDesign.' + c | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select [placeholder]="'booklet-config.unitScreenHeader.label' | translate"
                    (selectionChange)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="bookletConfig.unitScreenHeader">
          <mat-option *ngFor="let c of unitScreenHeaderOptions" [value]="c">
            {{'booklet-config.unitScreenHeader.' + c | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field>
        <mat-select [placeholder]="'booklet-config.unitTitle.label' | translate"
                    (selectionChange)="configChanged.emit();"
                    [disabled]="disabled"
                    [(ngModel)]="bookletConfig.unitTitle">
          <mat-option *ngFor="let c of unitTitleOptions" [value]="c">
            {{'booklet-config.unitTitle.' + c | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </dix>
  `
})
export class BookletConfigEditComponent {
  pagingModeOptions = ['separate', 'concat-scroll', 'concat-scroll-snap'];
  pageNaviButtonsOptions = ['OFF', 'SEPARATE_BOTTOM'];
  unitNaviButtonsOptions = ['OFF', 'ARROWS_ONLY', 'FULL'];
  controllerDesignOptions = ['2018', '2022'];
  unitScreenHeaderOptions = ['OFF', 'WITH_UNIT_TITLE', 'WITH_BOOKLET_TITLE', 'WITH_BLOCK_TITLE', 'EMPTY'];
  unitTitleOptions = ['OFF', 'ON'];
  bookletConfig: ReviewSettingsDto = bookletConfigDefault;
  @Output() configChanged = new EventEmitter();
  @Input('disabled') disabled = false;
  @Input('config')
  set config(value: ReviewSettingsDto | undefined) {
    this.bookletConfig = value || bookletConfigDefault;
  }

  get config(): ReviewSettingsDto {
    return this.bookletConfig;
  }
}
