import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import {
  BehaviorSubject, Subject, takeUntil
} from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton, MatFabButton } from '@angular/material/button';

import { ItemsMetadataValues, ProfileMetadataValues, UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ItemComponent } from '../item/item.component';
// eslint-disable-next-line max-len
import { MetadataReadonlyItemsComponent } from '../../../shared/components/metadata-readonly-items/metadata-readonly-items.component';
import { AliasId } from '../../models/alias-id.interface';

@Component({
  selector: 'studio-lite-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatIconButton, MatTooltip, WrappedIconComponent, ItemComponent, MatIcon, MatFabButton, MetadataReadonlyItemsComponent, TranslateModule]
})

export class ItemsComponent implements OnInit, OnChanges, OnDestroy {
  items: ItemsMetadataValues[] = [];
  variables!: AliasId[];
  isTextOnlyView = false;
  private ngUnsubscribe = new Subject<void>();

  @Input() variablesLoader!: BehaviorSubject<AliasId[]>;
  @Input() profileUrl!: string | undefined;
  @Input() metadata: Partial<UnitMetadataValues> = {};
  @Input() language!: string;

  @Output() metadataChange: EventEmitter<UnitMetadataValues> = new EventEmitter();

  ngOnInit(): void {
    this.variablesLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(variables => {
        this.variables = variables;
      });
    this.items = this.metadata.items || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const metadata = 'metadata';
    if (changes[metadata] &&
      !changes[metadata].firstChange &&
      changes[metadata].previousValue !== changes[metadata].currentValue) {
      this.items = this.metadata.items || [];
    }
  }

  togglePresentation(): void {
    this.isTextOnlyView = !this.isTextOnlyView;
  }

  remove(index: number): void {
    this.items.splice(index, 1);
    this.metadata.items = this.items;
    this.emitMetadata();
  }

  add(): void {
    this.items.push({});
    this.metadata.items = this.items;
    this.emitMetadata();
  }

  onMetadataChange(metadata: Partial<ProfileMetadataValues>[]): void {
    this.metadata.items = metadata;
    this.emitMetadata();
  }

  private emitMetadata(): void {
    this.metadataChange.emit(this.metadata);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
