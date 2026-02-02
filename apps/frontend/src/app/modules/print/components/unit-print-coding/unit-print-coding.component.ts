import {
  Component, Input, OnChanges, OnDestroy, SimpleChanges
} from '@angular/core';
import { VariableCodingData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { UnitPrintCodeComponent } from '../unit-print-code/unit-print-code.component';
import { ReviewBackendService } from '../../../review/services/review-backend.service';

@Component({
  selector: 'studio-lite-unit-print-coding',
  templateUrl: './unit-print-coding.component.html',
  styleUrls: ['./unit-print-coding.component.scss'],
  imports: [UnitPrintCodeComponent, TranslateModule]
})
export class UnitPrintCodingComponent implements OnChanges, OnDestroy {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() reviewId!: number;
  codings!: VariableCodingData[];

  private ngUnsubscribe = new Subject<void>();

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
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(unitScheme => {
        if (unitScheme?.scheme) {
          try {
            this.codings = JSON.parse(unitScheme.scheme).variableCodings
              .filter((vc: VariableCodingData) => vc.sourceType !== 'BASE_NO_VALUE');
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse scheme', e);
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
