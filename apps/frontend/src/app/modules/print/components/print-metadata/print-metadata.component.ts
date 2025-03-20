import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ItemsMetadataValues, MetadataValues, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { MetadataReadonlyItemsComponent }
  from '../../../shared/components/metadata-readonly-items/metadata-readonly-items.component';
import { MetadataProfileEntriesComponent }
  from '../../../shared/components/metadata-profile-entries/metadata-profile-entries.component';

@Component({
  selector: 'studio-lite-print-metadata',
  templateUrl: './print-metadata.component.html',
  styleUrls: ['./print-metadata.component.scss'],
  imports: [MetadataProfileEntriesComponent, MetadataReadonlyItemsComponent, TranslateModule]
})
export class PrintMetadataComponent implements OnChanges {
  @Input() metadata!: UnitMetadataValues | null;

  unitProfiles!: MetadataValues[];
  items!: ItemsMetadataValues[];

  ngOnChanges(changes: SimpleChanges): void {
    const changeProperty = 'metadata';
    if (changes[changeProperty] && this.metadata) {
      if (this.metadata.profiles) {
        this.unitProfiles = this.metadata.profiles;
      }
      if (this.metadata.items) {
        this.items = this.metadata.items;
      }
    }
  }
}
