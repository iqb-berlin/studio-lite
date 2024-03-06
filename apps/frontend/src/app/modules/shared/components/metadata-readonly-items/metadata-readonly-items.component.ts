import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-metadata-readonly-items',
  templateUrl: './metadata-readonly-items.component.html',
  styleUrls: ['./metadata-readonly-items.component.scss']
})
export class MetadataReadonlyItemsComponent {
  @Input() items: any[] = [];
}
