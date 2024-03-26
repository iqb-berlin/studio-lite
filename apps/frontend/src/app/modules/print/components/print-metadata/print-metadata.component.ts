import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
// eslint-disable-next-line max-len
import { MetadataReadonlyItemsComponent } from '../../../shared/components/metadata-readonly-items/metadata-readonly-items.component';
// eslint-disable-next-line max-len
import { MetadataProfileEntriesComponent } from '../../../shared/components/metadata-profile-entries/metadata-profile-entries.component';

@Component({
  selector: 'studio-lite-print-metadata',
  templateUrl: './print-metadata.component.html',
  styleUrls: ['./print-metadata.component.scss'],
  standalone: true,
  imports: [NgIf, MetadataProfileEntriesComponent, MetadataReadonlyItemsComponent, TranslateModule]
})
export class PrintMetadataComponent implements OnChanges {
  @Input() metadata!: any;

  unitProfiles!: any;
  items!: any;

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
