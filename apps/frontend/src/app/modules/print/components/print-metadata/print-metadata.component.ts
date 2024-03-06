import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';

@Component({
  selector: 'studio-lite-print-metadata',
  templateUrl: './print-metadata.component.html',
  styleUrls: ['./print-metadata.component.scss']
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
