import {
  AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild
} from '@angular/core';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';

@Component({
  selector: 'studio-lite-unit-table',
  templateUrl: './unit-table.component.html',
  styleUrls: ['./unit-table.component.scss']
})
export class UnitTableComponent implements AfterViewInit, OnChanges {
  @ViewChild(MatSort) sortTable!: MatSort;
  @ViewChild(MatSortHeader) sortHeader!: MatSortHeader;
  @Input() selectedUnitId!: number;
  @Input() unitList!: UnitInListDto[];
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

  sort(sortHeader: MatSortHeader) {
    this.sortTable.sort(sortHeader);
  }

  ngOnChanges(): void {
    if (!this.dataSource) {
      this.dataSource = new MatTableDataSource(this.unitList);
    }
  }

  onSortChange($event: Sort): void {
    if (this.hasSortHeader) {
      this.sortChange.emit({ sortState: $event, table: this });
    }
  }
}