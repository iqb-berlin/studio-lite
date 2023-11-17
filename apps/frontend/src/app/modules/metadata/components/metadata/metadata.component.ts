import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'studio-lite-metadata',
  templateUrl: './metadata.component.html',
  styleUrls: ['./metadata.component.scss']
})
export class MetadataComponent implements OnInit, OnDestroy {
  @Output() metadataChange: EventEmitter<any> = new EventEmitter();
  @Input() metadataLoader!: BehaviorSubject<any>;
  @Input() variablesLoader!: BehaviorSubject<string[]>;
  @Input() language!: string;
  @Input() unitMDProfile!: string;
  @Input() itemMDProfile!: string;

  metaData!: any;
  private ngUnsubscribe = new Subject<void>();

  ngOnInit(): void {
    this.metadataLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(metadata => {
        this.metaData = metadata;
      });
  }

  onMetadataChange(metadata: any): void {
    this.metadataChange.emit(metadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
