import { Component, Input, OnInit } from '@angular/core';
import { VariableCodingData } from '@iqb/responses';
import { TranslateModule } from '@ngx-translate/core';

import { BackendService } from '../../../workspace/services/backend.service';
import { UnitPrintCodeComponent } from '../unit-print-code/unit-print-code.component';

@Component({
  selector: 'studio-lite-unit-print-coding',
  templateUrl: './unit-print-coding.component.html',
  styleUrls: ['./unit-print-coding.component.scss'],
  standalone: true,
  imports: [UnitPrintCodeComponent, TranslateModule]
})
export class UnitPrintCodingComponent implements OnInit {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  codings!: VariableCodingData[];

  constructor(private backendService: BackendService) {
  }

  ngOnInit(): void {
    this.backendService.getUnitScheme(this.workspaceId, this.unitId)
      .subscribe(unitScheme => {
        if (unitScheme?.scheme) {
          this.codings = JSON.parse(unitScheme.scheme).variableCodings;
        }
      });
  }
}
