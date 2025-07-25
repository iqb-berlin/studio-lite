import {
  AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatTooltip } from '@angular/material/tooltip';
import { State } from '../../../admin/models/state.type';
import { StatePipe } from '../../pipes/state.pipe';
import { HasNewCommentsPipe } from '../../pipes/has-new-comments.pipe';
import { UnitDropBoxTooltipPipe } from '../../pipes/unit-dropbox-tooltip.pipe';
import { ScrollIntoViewDirective } from '../../directives/scroll-into-view.directive';

@Component({
  selector: 'studio-lite-unit-table',
  templateUrl: './unit-table.component.html',
  styleUrls: ['./unit-table.component.scss'],
  imports: [MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader,
    MatCellDef, MatCell, MatTooltip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow,
    TranslateModule, HasNewCommentsPipe, StatePipe, UnitDropBoxTooltipPipe, ScrollIntoViewDirective]
})
export class UnitTableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatSort) sortTable!: MatSort;
  @ViewChild(MatSortHeader) sortHeader!: MatSortHeader;
  @Input() states!: State[];
  @Input() selectedUnitId!: number;
  @Input() unitList!: UnitInListDto[];
  @Input() filter!: string;
  @Input() hasSortHeader!: boolean;
  @Output() selectUnit: EventEmitter<number> = new EventEmitter<number>();
  @Output() sortChange: EventEmitter<{
    sortState: Sort,
    table: UnitTableComponent
  }> = new EventEmitter<{
      sortState: Sort,
      table: UnitTableComponent
    }>();

  dataSource!: MatTableDataSource<UnitInListDto>;
  displayedColumns: string[] = ['key', 'name'];
  private selectUnitSubject: Subject<number> = new Subject<number>();

  constructor() {
    this.selectUnitSubject.pipe(
      debounceTime(300)
    ).subscribe((id: number) => {
      this.selectUnit.emit(id);
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sortTable;
  }

  sort(sortHeader: MatSortHeader): void {
    this.sortTable.sort(sortHeader);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.dataSource) {
      this.initDataSource();
    }
    const inputKey = 'filter';
    if (changes[inputKey]) {
      this.dataSource.filter = this.filter.trim().toLowerCase();
    }
  }

  private initDataSource(): void {
    this.dataSource = new MatTableDataSource(this.unitList);
    this.dataSource
      .filterPredicate = (unitList, filter) => this.displayedColumns
        .some(column => (unitList[column as keyof UnitInListDto] as string)
          .toLowerCase()
          .includes(filter));
  }

  onUnitClick(id: number): void {
    this.selectUnitSubject.next(id);
  }

  onSortChange($event: Sort): void {
    if (this.hasSortHeader) {
      this.sortChange.emit({ sortState: $event, table: this });
    }
  }
}
