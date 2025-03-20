import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { MetadataProfileEntriesComponent } from '../metadata-profile-entries/metadata-profile-entries.component';

@Component({
  selector: 'studio-lite-metadata-readonly-items',
  templateUrl: './metadata-readonly-items.component.html',
  styleUrls: ['./metadata-readonly-items.component.scss'],
  imports: [MetadataProfileEntriesComponent, TranslateModule]
})
export class MetadataReadonlyItemsComponent {
  @Input() items: ItemsMetadataValues[] = [];
}
