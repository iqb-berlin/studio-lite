import {
  AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { State } from '../../../admin/models/state.type';

@Component({
  selector: 'studio-lite-unit-table',
  templateUrl: './unit-table.component.html',
  styleUrls: ['./unit-table.component.scss']
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

  onSortChange($event: Sort): void {
    if (this.hasSortHeader) {
      this.sortChange.emit({ sortState: $event, table: this });
    }
  }
}
