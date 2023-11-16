import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { MetadataService } from '../../services/metadata.service';

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
  ngUnsubscribe = new Subject<void>();

  constructor(public metadataService: MetadataService) {}

  ngOnInit() {
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
