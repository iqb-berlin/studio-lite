import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { MetadataProfileEntriesComponent } from '../metadata-profile-entries/metadata-profile-entries.component';
import { AliasId } from '../../../metadata/models/alias-id.interface';
import { VariableIdPipe } from '../../pipes/variable-id.pipe';

@Component({
  selector: 'studio-lite-metadata-readonly-items',
  templateUrl: './metadata-readonly-items.component.html',
  styleUrls: ['./metadata-readonly-items.component.scss'],
  imports: [MetadataProfileEntriesComponent, TranslateModule, VariableIdPipe]
})
export class MetadataReadonlyItemsComponent {
  @Input() items: ItemsMetadataValues[] = [];
  @Input() variables!: AliasId[];
}
