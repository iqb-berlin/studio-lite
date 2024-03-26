import {
  Component, EventEmitter, Input, OnDestroy, Output, ViewChild
} from '@angular/core';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckbox } from '@angular/material/checkbox';

import { BackendService } from '../../services/backend.service';
import { HasSelectionValuePipe } from '../../../shared/pipes/hasSelectionValue.pipe';
import { IsAllSelectedPipe } from '../../../shared/pipes/isAllSelected.pipe';
import { IsSelectedPipe } from '../../../shared/pipes/isSelected.pipe';
import { IncludePipe } from '../../../shared/pipes/include.pipe';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

@Component({
  selector: 'studio-lite-select-unit-list',
  templateUrl: './select-unit-list.component.html',
  styleUrls: ['select-unit-list.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, IncludePipe, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe, TranslateModule]
})
export class SelectUnitListComponent implements OnDestroy {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'key', 'groupName'];
  tableSelectionCheckboxes = new SelectionModel <UnitInListDto>(true, []);
  disabledUnits: number[] = [];
  selectionChangedSubscription: Subscription | null = null;

  @Input() filter!: number[];
  @Input() initialSelection!: number[];
  @Input() selectedUnitId!: number;

  @Input('show-groups')
  set showGroups(value: boolean) {
    this.displayedColumns = value ? ['selectCheckbox', 'key', 'groupName'] : ['selectCheckbox', 'key'];
  }

  // TODO: move to ngChanges
  @Input('workspace')
  set workspaceId(value: number) {
    this.tableSelectionCheckboxes.clear();
    this.backendService.getUnitList(value)
      .subscribe(units => {
        this.setObjectsDatasource(units);
        this.setInitialSelection();
      });
  }

  private setObjectsDatasource(units: UnitInListDto[]): void {
    if (this.filter && this.filter.length) {
      this.objectsDatasource = new MatTableDataSource(
        units
          .filter(unit => this.filter.indexOf(unit.id) > -1)
      );
    } else {
      this.objectsDatasource = new MatTableDataSource(units);
    }
    this.objectsDatasource
      .filterPredicate = (unitList: UnitInListDto, filter) => ['key', 'groupName']
        .some(column => (unitList[column as keyof UnitInListDto] as string || '')
          .toLowerCase()
          .includes(filter)
        );

    this.objectsDatasource.sort = this.sort;
    this.objectsDatasource.data.forEach(row => {
      if (row.id === this.selectedUnitId) this.tableSelectionCheckboxes.select(row);
    });
  }

  private setInitialSelection(): void {
    if (this.initialSelection && this.initialSelection.length) {
      this.selectedUnitIds = this.initialSelection;
      this.selectionChanged.emit(this.selectedUnitIds);
    }
  }

  multipleSelection = true;
  @Input('multiple')
  set multiple(value: boolean) {
    this.multipleSelection = value;
    this.tableSelectionCheckboxes = new SelectionModel <UnitInListDto>(value, []);
  }

  @Input('disabled')
  set disabled(value: number[]) {
    this.disabledUnits = value;
    this.objectsDatasource.data.forEach(ud => {
      if (this.disabledUnits.indexOf(ud.id) >= 0) this.tableSelectionCheckboxes.deselect(ud);
    });
  }

  @Output() selectionChanged = new EventEmitter<number[]>();

  get selectionCount(): number {
    return this.tableSelectionCheckboxes.selected.length;
  }

  get selectedUnitIds(): number[] {
    return this.tableSelectionCheckboxes.selected.map(ud => ud.id);
  }

  // TODO move to ngChanges
  @Input('selectedUnitIds')
  set selectedUnitIds(newUnits: number[]) {
    if (this.selectionChangedSubscription) this.selectionChangedSubscription.unsubscribe();
    this.tableSelectionCheckboxes.clear();
    this.objectsDatasource.data.forEach(row => {
      if (newUnits.includes(row.id)) this.tableSelectionCheckboxes.select(row);
    });
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed.subscribe(() => {
      this.selectionChanged.emit(this.selectedUnitIds);
    });
  }

  get selectedUnitKey(): string {
    const selectedUnits = this.tableSelectionCheckboxes.selected;
    if (selectedUnits.length > 0) return selectedUnits[0].key;
    return '';
  }

  get selectedUnitName(): string {
    const selectedUnits = this.tableSelectionCheckboxes.selected;
    if (selectedUnits.length > 0 && selectedUnits[0].name) return selectedUnits[0].name;
    return '';
  }

  @ViewChild(MatSort) sort = new MatSort();

  constructor(private backendService: BackendService) {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed
      .subscribe(() => this.selectionChanged.emit(this.selectedUnitIds));
  }

  private isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckboxes.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckboxes.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckboxes.select(row));
  }

  ngOnDestroy(): void {
    if (this.selectionChangedSubscription) this.selectionChangedSubscription.unsubscribe();
  }
}
