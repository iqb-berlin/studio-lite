import { Component, Input } from '@angular/core';
import { CodeData } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'studio-lite-unit-print-code',
  templateUrl: './unit-print-code.component.html',
  styleUrls: ['./unit-print-code.component.scss'],
  imports: [TranslateModule]
})
export class UnitPrintCodeComponent {
  @Input() codeData!: CodeData;
}
