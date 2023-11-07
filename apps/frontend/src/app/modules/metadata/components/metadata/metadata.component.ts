import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { WorkspaceSettings } from '../../../wsg-admin/models/workspace-settings.interface';

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
  @Input() workspaceSettings!: WorkspaceSettings;

  onMetadataChange(metadata: { metadata: any, key: string, profileId: string }): void {
    this.metadataChange.emit(metadata);
  }
}
