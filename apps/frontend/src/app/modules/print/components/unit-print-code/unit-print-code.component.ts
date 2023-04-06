import { Component, Input } from '@angular/core';
import { CodeData } from '@studio-lite/shared-code';

@Component({
  selector: 'studio-lite-unit-print-code',
  templateUrl: './unit-print-code.component.html',
  styleUrls: ['./unit-print-code.component.scss']
})
export class UnitPrintCodeComponent {
  @Input() codeData!: CodeData;
}
