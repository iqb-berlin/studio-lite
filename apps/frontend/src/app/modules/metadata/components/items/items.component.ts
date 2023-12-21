import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import {
  BehaviorSubject, Subject, takeUntil
} from 'rxjs';

@Component({
  selector: 'studio-lite-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, OnChanges, OnDestroy {
  items: any[] = [];
  variables!: string[];
  isTextOnlyView = false;
  private ngUnsubscribe = new Subject<void>();

  @Input() variablesLoader!: BehaviorSubject<string[]>;
  @Input() profileUrl!: string | undefined;
  @Input() metadataKey!: 'profiles' | 'items';
  @Input() metadata!: any;
  @Input() language!: string;

  @Output() metadataChange: EventEmitter<any> = new EventEmitter();

  ngOnInit(): void {
    this.variablesLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(variables => {
        this.variables = variables;
      });
    this.items = this.metadata[this.metadataKey] || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const metadata = 'metadata';
    if (changes[metadata] &&
      !changes[metadata].firstChange &&
      changes[metadata].previousValue !== changes[metadata].currentValue) {
      this.items = this.metadata[this.metadataKey] || [];
    }
  }

  togglePresentation(): void {
    this.isTextOnlyView = !this.isTextOnlyView;
  }

  remove(index: number): void {
    this.items.splice(index, 1);
    this.metadata[this.metadataKey] = this.items;
    this.metadataChange.emit(this.metadata);
  }

  add(): void {
    this.items.push({});
    this.metadata[this.metadataKey] = this.items;
    this.metadataChange.emit(this.metadata);
  }

  onMetadataChange(metadata: any): void {
    this.metadata[this.metadataKey] = metadata;
    this.metadataChange.emit(this.metadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
