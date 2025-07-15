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
import { MatDialog } from '@angular/material/dialog';
import { MDProfile } from '@iqb/metadata';
import { FormsModule } from '@angular/forms';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ItemComponent } from '../item/item.component';
import {
  MetadataReadonlyItemsComponent
} from '../../../shared/components/metadata-readonly-items/metadata-readonly-items.component';
import { AliasId } from '../../models/alias-id.interface';
import { NewItemComponent } from '../new-item/new-item.component';
import { ItemSortService } from '../../services/item-sort.service';
import { SortAscendingPipe } from '../../../comments/pipes/sort-ascending.pipe';

@Component({
  selector: 'studio-lite-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
  imports: [MatIconButton, MatTooltip, WrappedIconComponent, ItemComponent, MatIcon,
    MatFabButton, MetadataReadonlyItemsComponent, TranslateModule, FormsModule]
})

export class ItemsComponent implements OnInit, OnChanges, OnDestroy {
  items: ItemsMetadataValues[] = [];
  variables!: AliasId[];
  isTextOnlyView = false;
  lastUpdatedItemIndex: BehaviorSubject<number> = new BehaviorSubject<number>(-1);
  private ngUnsubscribe = new Subject<void>();

  @Input() variablesLoader!: BehaviorSubject<AliasId[]>;
  @Input() profile!: MDProfile;
  @Input() metadata: Partial<UnitMetadataValues> = {};
  @Input() language!: string;

  @Output() metadataChange: EventEmitter<UnitMetadataValues> = new EventEmitter();

  constructor(
    private addItemDialog: MatDialog,
    public itemSortService: ItemSortService
  ) {}

  ngOnInit(): void {
    this.variablesLoader
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(variables => {
        this.variables = variables;
      });
    this.setItems();
  }

  private setItems(): void {
    this.items = this.metadata.items || [];
    this.sortItems(this.itemSortService.currenItemSorting);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const metadata = 'metadata';
    if (changes[metadata] &&
      !changes[metadata].firstChange &&
      changes[metadata].previousValue !== changes[metadata].currentValue) {
      this.setItems();
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
    if (!this.items.length) {
      this.addItem({});
    } else {
      this.openDialog();
    }
  }

  private openDialog(): void {
    const dialogRef = this.addItemDialog.open(NewItemComponent, {
      autoFocus: false,
      data: {
        items: structuredClone(this.items)
      },
      width: '400px'
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((result?: number) => this.onCloseDialog(result));
  }

  private onCloseDialog(result?: number): void {
    if (result === undefined) return;
    if (result === -1) {
      this.addItem({});
    } else {
      const item = structuredClone(this.items[result]);
      if (item.profiles) {
        item.profiles = item.profiles
          .map(profile => (profile.isCurrent ? profile : {}));
      }
      this.addItem({
        ...item,
        id: undefined,
        uuid: undefined,
        order: undefined,
        position: undefined,
        locked: undefined,
        variableId: undefined,
        variableReadOnlyId: undefined,
        weighting: undefined,
        description: undefined,
        createdAt: undefined,
        changedAt: undefined
      });
    }
  }

  private addItem(item: ItemsMetadataValues): void {
    this.items.push(item);
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

  sortItems(key: string) {
    this.items
      .sort((a, b) => SortAscendingPipe.sortAscending(a, b, key));
    this.itemSortService.currenItemSorting = key;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
