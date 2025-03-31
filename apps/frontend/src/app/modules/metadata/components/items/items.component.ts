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
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ItemComponent } from '../item/item.component';
import {
  MetadataReadonlyItemsComponent
} from '../../../shared/components/metadata-readonly-items/metadata-readonly-items.component';
import { AliasId } from '../../models/alias-id.interface';
import { NewItemComponent } from '../new-item/new-item.component';

@Component({
  selector: 'studio-lite-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
  imports: [MatIconButton, MatTooltip, WrappedIconComponent, ItemComponent, MatIcon,
    MatFabButton, MetadataReadonlyItemsComponent, TranslateModule]
})

export class ItemsComponent implements OnInit, OnChanges, OnDestroy {
  items: ItemsMetadataValues[] = [];
  variables!: AliasId[];
  isTextOnlyView = false;
  private ngUnsubscribe = new Subject<void>();
  @Input() profile !: MDProfile;
  @Input() variablesLoader!: BehaviorSubject<AliasId[]>;
  @Input() metadata: Partial<UnitMetadataValues> = {};
  @Input() language!: string;
  @Output() metadataChange: EventEmitter<UnitMetadataValues> = new EventEmitter();

  constructor(private addItemDialog: MatDialog) {}

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

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
