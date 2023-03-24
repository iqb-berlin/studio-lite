import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-unit-print-header',
  templateUrl: './unit-print-header.component.html',
  styleUrls: ['./unit-print-header.component.scss']
})
export class UnitPrintHeaderComponent {
  @Input() name!: string | undefined | null;
  @Input() key!: string | undefined | null;
  @Input() description!: string | undefined | null;
  @Input() groupName!: string | undefined | null;
  @Input() player!: string;
  @Input() editor!: string | undefined | null;
  @Input() schemer!: string | undefined | null;
  @Input() lastChangedDefinition!: Date | undefined | null;
  @Input() lastChangedMetadata!: Date | undefined | null;
  @Input() lastChangedScheme!: Date | undefined | null;
}
