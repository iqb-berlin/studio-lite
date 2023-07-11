import {
  Component, Input, ViewChild
} from '@angular/core';
import { CodingSchemeDto, VariableCodingData } from '@studio-lite/shared-code';
import { BackendService } from '../../services/backend.service';
import { ReviewService } from '../../services/review.service';
import { UnitInfoLoaderComponent } from '../unit-info-loader/unit-info-loader.component';

@Component({
  selector: 'studio-lite-unit-info-coding',
  templateUrl: './unit-info-coding.component.html',
  styleUrls: ['./unit-info-coding.component.scss']
})
export class UnitInfoCodingComponent {
  @ViewChild(UnitInfoLoaderComponent) loader?: UnitInfoLoaderComponent;
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
        this.backendService.getUnitCoding(
          this.reviewService.reviewId, unitData.databaseId
        ).subscribe(unitScheme => {
          if (this.loader) this.loader.spinnerOn = false;
          if (unitScheme) {
            try {
              const codingScheme: CodingSchemeDto = JSON.parse(unitScheme.scheme);
              unitData.codingSchemeVariables = codingScheme.variableCodings || [];
              this.allVariables = codingScheme.variableCodings || [];
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
