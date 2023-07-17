import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-unit-metadata',
  templateUrl: './unit-meta-data.component.html',
  styleUrls: ['./unit-meta-data.component.scss']
})
export class UnitMetaDataComponent {
  @Input() name!: string | undefined | null;
  @Input() key!: string | undefined | null;
  @Input() description!: string | undefined | null;
  @Input() transcript!: string | undefined | null;
  @Input() reference!: string | undefined | null;
  @Input() groupName!: string | undefined | null;
  @Input() player!: string;
  @Input() editor!: string | undefined | null;
  @Input() schemer!: string | undefined | null;
  @Input() lastChangedDefinition!: Date | undefined | null;
  @Input() lastChangedMetadata!: Date | undefined | null;
  @Input() lastChangedScheme!: Date | undefined | null;
}
