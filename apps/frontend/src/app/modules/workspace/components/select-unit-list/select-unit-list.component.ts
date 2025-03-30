import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild
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

import { HttpParams } from '@angular/common/http';
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
  // eslint-disable-next-line max-len
  imports: [SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef, MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, IncludePipe, IsSelectedPipe, IsAllSelectedPipe, HasSelectionValuePipe, TranslateModule]
})
export class SelectUnitListComponent implements OnChanges, OnDestroy, AfterViewInit {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'key', 'name', 'groupName'];
  tableSelectionCheckboxes = new SelectionModel <UnitInListDto>(true, []);
  disabledUnits: number[] = [];
  selectionChangedSubscription: Subscription | null = null;
  multipleSelection = true;

  constructor(private backendService: BackendService) {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed
      .subscribe(() => this.selectionChanged.emit(this.selectedUnitIds));
  }

  @Input() filter!: number[];
  @Input() initialSelection!: number[];
  @Input() unitToBeDeletedId!: number;
  @Input() queryParams!: HttpParams;
  @Input() workspace!: number;
  @Input() selectedUnitIds: number[] = [];
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
  @Input('show-groups')
  set showGroups(value: boolean) {
    this.displayedColumns = value ? ['selectCheckbox', 'key', 'groupName'] : ['selectCheckbox', 'key'];
  }

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  @ViewChild(MatSort) sort = new MatSort();

  ngOnChanges(changes: SimpleChanges): void {
    const { workspace, unitToBeDeletedId, selectedUnitIds } = changes;
    if (workspace && workspace.currentValue) this.updateUnitList(workspace.currentValue);
    if (unitToBeDeletedId && unitToBeDeletedId.currentValue) {
      this.scrollToUnit(unitToBeDeletedId.currentValue);
    }
    if (selectedUnitIds && selectedUnitIds.currentValue) {
      this.updateSelection(selectedUnitIds.currentValue);
    }
  }

  updateUnitList(value: number): void {
    this.tableSelectionCheckboxes.clear();
    this.backendService.getUnitList(value, this.queryParams)
      .subscribe(units => {
        this.setObjectsDatasource(units);
        this.setInitialSelection();
        if (this.unitToBeDeletedId) {
          this.scrollToUnit(this.unitToBeDeletedId);
        }
      });
  }

  /**
   * Methode zum Scrollen zur bestimmten Einheit in der Tabelle
   * @param unitId ID der Einheit
   */
  scrollToUnit(unitId: number): void {
    if (this.objectsDatasource && this.objectsDatasource.data.length > 0) {
      const unitIndex = this.objectsDatasource.data
        .findIndex(unit => unit.id === unitId);
      if (unitIndex !== -1) {
        const tableRows = this.tableContainer.nativeElement.querySelectorAll('mat-row');
        const targetRow = tableRows[unitIndex];
        if (targetRow) {
          targetRow.scrollIntoView({ block: 'center' });
        }
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.unitToBeDeletedId) {
      setTimeout(() => {
        this.scrollToUnit(this.unitToBeDeletedId);
      }, 200
      );
    }
  }

  private setObjectsDatasource(units: UnitInListDto[]): void {
    const filteredUnits = this.filter?.length ?
      units.filter(unit => this.filter.includes(unit.id)) :
      units;

    this.objectsDatasource = new MatTableDataSource(filteredUnits);

    this.objectsDatasource
      .filterPredicate = (unitList: UnitInListDto, filter: string) => ['key', 'name', 'groupName']
        .some(column => (unitList[column as keyof UnitInListDto] as string || '')
          .toLowerCase()
          .includes(filter.toLowerCase())
        );

    this.objectsDatasource.sort = this.sort;

    const rowToBeDeleted = this.objectsDatasource.data
      .find(row => row.id === this.unitToBeDeletedId);
    if (rowToBeDeleted) {
      this.tableSelectionCheckboxes.select(rowToBeDeleted);
    }
  }

  private setInitialSelection(): void {
    if (this.initialSelection && this.initialSelection.length) {
      this.selectedUnitIds = this.initialSelection;
      this.selectionChanged.emit(this.selectedUnitIds);
    }
  }

  get selectionCount(): number {
    return this.tableSelectionCheckboxes.selected.length;
  }

  private updateSelection(newUnits: number[]): void {
    if (!newUnits || newUnits.length === 0) {
      if (this.selectionChangedSubscription) {
        this.selectionChangedSubscription.unsubscribe();
        this.selectionChangedSubscription = null;
      }
      this.tableSelectionCheckboxes.clear();
      return;
    }
    if (this.selectionChangedSubscription) {
      this.selectionChangedSubscription.unsubscribe();
      this.selectionChangedSubscription = null;
    }
    this.tableSelectionCheckboxes.clear();
    const data = this.objectsDatasource.data;
    const selectedRows = data.filter(row => newUnits.includes(row.id));
    selectedRows.forEach(row => this.tableSelectionCheckboxes.select(row));
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
