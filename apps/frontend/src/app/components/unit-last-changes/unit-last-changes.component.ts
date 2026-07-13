import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'studio-lite-unit-last-changes',
  templateUrl: './unit-last-changes.component.html',
  styleUrls: ['./unit-last-changes.component.scss'],
  imports: [DatePipe, TranslateModule]
})
export class UnitLastChangesComponent {
  @Input() lastChangedDefinition!: Date | undefined | null;
  @Input() lastChangedMetadata!: Date | undefined | null;
  @Input() lastChangedScheme!: Date | undefined | null;
  @Input() lastChangedDefinitionUser!: string | undefined | null;
  @Input() lastChangedMetadataUser!: string | undefined | null;
  @Input() lastChangedSchemeUser!: string | undefined | null;
}
