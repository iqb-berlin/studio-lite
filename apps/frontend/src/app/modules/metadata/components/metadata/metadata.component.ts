import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent {
  @Output() metadataChange: EventEmitter<{ metadata: any, key: string, profileId: string }> = new EventEmitter();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() itemsLoader!: BehaviorSubject<string[]>;
  @Input() language!: string;
  @Input() unitMDProfile!: string;
  @Input() itemMDProfile!: string;

  onMetadataChange(metadata: { metadata: any, key: string, profileId: string }): void {
    this.metadataChange.emit(metadata);
  }
}
