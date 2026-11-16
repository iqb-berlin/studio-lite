import {
  Component, EventEmitter, Input, OnChanges, OnDestroy, Output, signal, SimpleChanges, ViewChild
} from '@angular/core';
import {

  MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow,
  MatRowDef, MatRow
} from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';

import { HttpParams } from '@angular/common/http';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { IsSelectedPipe } from '../../../../pipes/is-selected.pipe';
import { SelectionScopeStatePipe } from '../../../../pipes/selection-scope-state.pipe';
import { deselectHidden, SelectionScope, toggleAllInScope } from '../../../../utils/selection-scope.utils';
import { IncludePipe } from '../../../../pipes/include.pipe';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { ScrollIntoViewDirective } from '../../directives/scroll-into-view.directive';
import { TextSortTableDataSource } from '../../../../models/text-sort-table-data-source.class';

/**
 * A tickable list of units, used wherever a selection has to be made outside the workspace itself --
 * putting units into a review, into a group, into an export.
 */
@Component({
  selector: 'studio-lite-select-unit-list',
  templateUrl: './select-unit-list.component.html',
  styleUrls: ['select-unit-list.component.scss'],

  imports: [
    SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCheckbox, MatCellDef,
    MatCell, MatSortHeader, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatSlideToggle, MatTooltip,
    IncludePipe, IsSelectedPipe, SelectionScopeStatePipe, TranslateModule, ScrollIntoViewDirective
  ]
})
export class SelectUnitListComponent implements OnChanges, OnDestroy {
  private static readonly allColumns = ['selectCheckbox', 'key', 'name', 'groupName'];
  objectsDatasource = new TextSortTableDataSource<UnitInListDto>();
  displayedColumns = SelectUnitListComponent.allColumns;
  tableSelectionCheckboxes = new SelectionModel <UnitInListDto>(true, []);
  // What the header checkbox acts on (#433). It keeps its setting while the list is shown, also when
  // the group management or the review admin swaps the selection.
  readonly selectionScope = signal<SelectionScope>('all');
  // Set again on every data source the list loads: the copy dialog loads another workspace's units
  // while the search field keeps its term (#2139).
  private readonly searchTerm = signal('');
  disabledUnits: number[] = [];
  selectionChangedSubscription: Subscription | null = null;

  @Input() filter!: number[];
  @Input() initialSelection!: number[];
  @Input() selectedUnitId!: number;
  @Input() queryParams!: HttpParams;
  @Input() workspace!: number;
  // Disables every checkbox, for as long as the selection is about to be set from outside;
  // `disabled` instead names single units that can never be selected.
  @Input() locked = false;

  // Leaves out the group alone. A list of its own here lost the name when it got a column (#2014).
  @Input('show-groups')
  set showGroups(value: boolean) {
    this.displayedColumns = SelectUnitListComponent.allColumns.filter(column => value || column !== 'groupName');
  }

  updateUnitList(value: number) {
    this.tableSelectionCheckboxes.clear();
    this.backendService.getUnitList(value, this.queryParams)
      .subscribe(units => {
        this.setObjectsDatasource(units);
        this.setInitialSelection();
      });
  }

  private setObjectsDatasource(units: UnitInListDto[]): void {
    if (this.filter && this.filter.length) {
      this.objectsDatasource = new TextSortTableDataSource(
        units
          .filter(unit => this.filter.indexOf(unit.id) > -1)
      );
    } else {
      this.objectsDatasource = new TextSortTableDataSource(units);
    }
    this.objectsDatasource
      .filterPredicate = (unitList: UnitInListDto, filter) => ['key', 'name', 'groupName']
        .some(column => (unitList[column as keyof UnitInListDto] as string || '')
          .toLowerCase()
          .includes(filter)
        );
    this.objectsDatasource.filter = this.searchTerm();

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

  constructor(private backendService: WorkspaceBackendService) {
    this.selectionChangedSubscription = this.tableSelectionCheckboxes.changed
      .subscribe(() => this.selectionChanged.emit(this.selectedUnitIds));
  }

  filterUnits(term: string): void {
    this.searchTerm.set(term.trim().toLowerCase());
    this.objectsDatasource.filter = this.searchTerm();
  }

  masterToggle(): void {
    toggleAllInScope(this.tableSelectionCheckboxes, this.objectsDatasource, this.selectionScope());
  }

  deselectHidden(): void {
    deselectHidden(this.tableSelectionCheckboxes, this.objectsDatasource);
  }

  ngOnDestroy(): void {
    if (this.selectionChangedSubscription) this.selectionChangedSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { workspace } = changes;
    if (workspace && workspace.currentValue) this.updateUnitList(workspace.currentValue);
  }
}
