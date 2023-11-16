import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import {
  BehaviorSubject, Subject, takeUntil
} from 'rxjs';

@Component({
  selector: 'studio-lite-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, OnDestroy {
  items: any[] = [];
  variables!: string[];
  private ngUnsubscribe = new Subject<void>();

  @Input() variablesLoader!: BehaviorSubject<string[]>;
  @Input() profileUrl!: string | undefined;
  @Input() metadataKey!: 'unitProfiles' | 'items';
  @Input() metadata!: any;
  @Input() language!: string;

  @Output() metadataChange: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.variablesLoader
      .pipe(
        takeUntil(this.ngUnsubscribe))
      .subscribe(variable => {
        this.variables = variable;
      });
    this.items = this.metadata[this.metadataKey] || [];
  }

  remove(index: number): void {
    this.items.splice(index, 1);
    const loadedMetadata = JSON.parse(JSON.stringify(this.metadata));
    loadedMetadata[this.metadataKey] = this.items;
    this.metadataChange.emit(loadedMetadata);
  }

  add(): void {
    const items = JSON.parse(JSON.stringify(this.items));
    items.push({});
    const loadedMetadata = JSON.parse(JSON.stringify(this.metadata));
    loadedMetadata[this.metadataKey] = items;
    this.items = items;
    this.metadataChange.emit(loadedMetadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onMetadataChange(metadata: any) {
    const loadedMetadata = JSON.parse(JSON.stringify(this.metadata));
    loadedMetadata[this.metadataKey] = metadata;
    this.metadataChange.emit(loadedMetadata);
  }
}
