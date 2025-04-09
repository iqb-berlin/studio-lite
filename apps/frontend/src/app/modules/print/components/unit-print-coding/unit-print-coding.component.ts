import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { TranslateModule } from '@ngx-translate/core';

import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { UnitPrintCodeComponent } from '../unit-print-code/unit-print-code.component';
import { ReviewBackendService } from '../../../review/services/review-backend.service';

@Component({
  selector: 'studio-lite-unit-print-coding',
  templateUrl: './unit-print-coding.component.html',
  styleUrls: ['./unit-print-coding.component.scss'],
  imports: [UnitPrintCodeComponent, TranslateModule]
})
export class UnitPrintCodingComponent implements OnChanges {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() reviewId!: number;
  codings!: VariableCodingData[];

  constructor(
    private workspaceBackendService: WorkspaceBackendService,
    private reviewBackendService: ReviewBackendService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { unitId, workspaceId, reviewId } = changes;
    if (unitId || workspaceId || reviewId) {
      if (this.workspaceId || this.reviewId) {
        const service = this.workspaceId ?
          this.workspaceBackendService : this.reviewBackendService;
        this.fetchCodings(service);
      }
    }
  }

  private fetchCodings(service: WorkspaceBackendService | ReviewBackendService): void {
    service.getUnitScheme(this.workspaceId, this.unitId)
      .subscribe(unitScheme => {
        if (unitScheme?.scheme) {
          this.codings = JSON.parse(unitScheme.scheme).variableCodings
            .filter((vc: VariableCodingData) => vc.sourceType !== 'BASE_NO_VALUE');
        }
      });
  }
}
