import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { WorkspaceSettings } from '../../../wsg-admin/models/workspace-settings.interface';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit, OnDestroy {
  @Output() metadataChange: EventEmitter<{ metadata: any, key: string, profileId: string }> = new EventEmitter();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() itemsLoader!: BehaviorSubject<string[]>;
  @Input() language!: string;
  @Input() workspaceSettings!: WorkspaceSettings;

  private ngUnsubscribe = new Subject<void>();
  items!: string[];

  onMetadataChange(metadata: { metadata: any, key: string, profileId: string }): void {
    this.metadataChange.emit(metadata);
  }

  ngOnInit(): void {
    this.itemsLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(items => {
        this.items = items;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
