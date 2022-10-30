import {
  Component, Input, ViewChild
} from '@angular/core';
import { CodingSchemeDto, VariableCodingData } from '@studio-lite/shared-code';
import { BackendService } from '../../backend.service';
import { ReviewService } from '../../review.service';
import { UnitInfoLoaderComponent } from './unit-info-loader.component';

@Component({
  selector: 'unit-info-coding',
  template: `
    <div fxLayout="column" [style.minHeight.px]="minHeight">
      <div class="unit-info-coding-header">Kodierung</div>
      <unit-info-loader #loader (onEnter)="updateContent()"></unit-info-loader>
      <div *ngIf="allVariables.length === 0">
      {{ loader?.spinnerOn ? 'lade...' : 'Keine Kodierinformationen verfügbar.'}}
      </div>
      <div class="unit-info-coding-content" *ngFor="let c of allVariables">
        <div fxLayout="row" fxLayoutAlign="space-between">
            <h4>{{c.id}}</h4>
            <h4>{{c.sourceType === 'BASE' ? 'B' : 'A'}}</h4>
        </div>
        <div *ngIf="c.label">{{c.label}}</div>
        <div *ngIf="c.manualInstruction" [innerHTML]="c.manualInstruction"></div>
      </div>
    </div>
  `,
  styles: [
    `.unit-info-coding-header {
      align-content: stretch;
      background-color: rgba(65,208,247,0.32);
      font-size: large;
      padding: 2px 6px;
    }`,
    `.unit-info-coding-content {
      border-top: 1px solid darkgray;
      margin: 4px 0;
    }`,
    `.unit-info-coding-content h4 {
      margin: 4px 0;
    }`
  ]
})
export class UnitInfoCodingComponent {
  @ViewChild(UnitInfoLoaderComponent) loader?: UnitInfoLoaderComponent;
  minHeight = 1000;
  _unitId = 0;
  @Input('unitId')
  set unitId(value: number) {
    this._unitId = value;
    this.updateContent();
  }

  allVariables: VariableCodingData[] = [];

  constructor(
    private backendService: BackendService,
    public reviewService: ReviewService
  ) {}

  updateContent() {
    this.allVariables = [];
    if (this.reviewService.units[this._unitId] && this.loader && this.loader?.isInView) {
      const unitData = this.reviewService.units[this._unitId];
      if (unitData.codingSchemeVariables) {
        this.allVariables = unitData.codingSchemeVariables || [];
      } else {
        this.loader.spinnerOn = true;
        this.minHeight = 1000;
        this.backendService.getUnitCoding(
          this.reviewService.reviewId, unitData.databaseId
        ).subscribe(unitScheme => {
          if (this.loader) this.loader.spinnerOn = false;
          if (unitScheme) {
            try {
              const codingScheme: CodingSchemeDto = JSON.parse(unitScheme.scheme);
              unitData.codingSchemeVariables = codingScheme.variableCodings || [];
              this.allVariables = codingScheme.variableCodings || [];
              this.minHeight = 0;
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn(`invalid coding scheme for ${unitData.databaseId}/${unitData.name}`);
              this.allVariables = [];
            }
          } else {
            this.allVariables = [];
          }
        });
      }
    }
  }
}
