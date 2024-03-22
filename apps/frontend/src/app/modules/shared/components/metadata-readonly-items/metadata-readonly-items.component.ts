import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MetadataProfileEntriesComponent } from '../metadata-profile-entries/metadata-profile-entries.component';
import { NgFor } from '@angular/common';

@Component({
    selector: 'studio-lite-metadata-readonly-items',
    templateUrl: './metadata-readonly-items.component.html',
    styleUrls: ['./metadata-readonly-items.component.scss'],
    standalone: true,
    imports: [NgFor, MetadataProfileEntriesComponent, TranslateModule]
})
export class MetadataReadonlyItemsComponent {
  @Input() items: any[] = [];
}
