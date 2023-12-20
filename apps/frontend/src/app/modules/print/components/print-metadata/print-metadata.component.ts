import { Component, Input } from '@angular/core';

@Component({
  selector: 'studio-lite-print-metadata',
  templateUrl: './print-metadata.component.html',
  styleUrls: ['./print-metadata.component.scss']
})
export class PrintMetadataComponent {
  @Input() metadata!: any;
}
