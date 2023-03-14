import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { SelectionModel } from '@angular/cdk/collections';
import { MatSort } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { BackendService } from '../backend.service';

@Component({
  selector: 'select-unit-list',
  template: `
    <div fxLayout="column" class="unit-list-wrapper">
      <div *ngIf="multipleSelection">
        <p *ngIf="selectionCount === 0">Bitte Aufgaben auswählen!</p>
        <p *ngIf="selectionCount === 1">Eine Aufgabe ausgewählt.</p>
        <p *ngIf="selectionCount > 1">{{selectionCount}} Aufgaben ausgewählt.</p>
      </div>

      <mat-form-field appearance="outline">
        <mat-label>{{'select-unit-list.filter' | translate}}</mat-label>
        <input #filterInput
               matInput
               [placeholder]="'select-unit-list.enter-filter' | translate"
               (keyup)="applyFilter(filterInput)">
        <button matSuffix
                mat-icon-button
                [attr.aria-label]="'select-unit-list.delete-filter' | translate"
                [disabled]="!filterInput.value"
                [matTooltip]="'select-unit-list.delete-filter' | translate"
                matTooltipPosition="above"
                (click)="filterInput.value=''; applyFilter(filterInput)">
          <mat-icon>close</mat-icon>
        </button>
      </mat-form-field>

      <mat-table [dataSource]="objectsDatasource" matSort class="unit-list">
        <ng-container matColumnDef="selectCheckbox">
          <mat-header-cell *matHeaderCellDef fxFlex="70px">
            <mat-checkbox (change)="$event ? masterToggle() : null"
                          [checked]="tableSelectionCheckbox.hasValue() && isAllSelected()"
                          [indeterminate]="tableSelectionCheckbox.hasValue() && !isAllSelected()">
            </mat-checkbox>
          </mat-header-cell>
          <mat-cell *matCellDef="let row" fxFlex="70px">
            <mat-checkbox (click)="$event.stopPropagation()"
                          [disabled]="disabledUnits.indexOf(row.id) >= 0"
                          (change)="$event ? tableSelectionCheckbox.toggle(row) : null"
                          [checked]="tableSelectionCheckbox.isSelected(row)">
            </mat-checkbox>
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="key">
          <mat-header-cell *matHeaderCellDef mat-sort-header="key"> Aufgabe</mat-header-cell>
          <mat-cell *matCellDef="let element"
                    [class]="(disabledUnits.indexOf(element.id) >= 0) ? 'disabled-element' : ''">
            {{element.key}}{{element.name ? ' - ' + element.name : ''}}
          </mat-cell>
        </ng-container>

        <ng-container matColumnDef="groupName">
          <mat-header-cell *matHeaderCellDef mat-sort-header="groupName"> Gruppe</mat-header-cell>
          <mat-cell *matCellDef="let element"
                    [class]="(disabledUnits.indexOf(element.id) >= 0) ? 'disabled-element' : ''">
            {{element.groupName}}
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
    </div>
  `,
  styles: [
    '.unit-list-wrapper {height: 100%}',
    '.unit-list {overflow-x: auto}',
    '.disabled-element {color: gray}'
  ]
})
export class SelectUnitListComponent implements OnInit, OnDestroy {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'key', 'groupName'];
  tableSelectionCheckbox = new SelectionModel <UnitInListDto>(true, []);
  disabledUnits: number[] = [];
  selectionChangedSubscription: Subscription | null = null;

  @Input('show-groups')
  set showGroups(value: boolean) {
    this.displayedColumns = value ? ['selectCheckbox', 'key', 'groupName'] : ['selectCheckbox', 'key'];
  }

  @Input('workspace')
  set workspaceId(value: number) {
    this.tableSelectionCheckbox.clear();
    this.backendService.getUnitList(value).subscribe(unitData => {
      this.objectsDatasource = new MatTableDataSource(unitData);
      this.objectsDatasource.sort = this.sort;
    });
  }

  multipleSelection = true;
  @Input('multiple')
  set multiple(value: boolean) {
    this.multipleSelection = value;
    this.tableSelectionCheckbox = new SelectionModel <UnitInListDto>(value, []);
  }

  @Input('disabled')
  set disabled(value: number[]) {
    this.disabledUnits = value;
    this.objectsDatasource.data.forEach(ud => {
      if (this.disabledUnits.indexOf(ud.id) >= 0) this.tableSelectionCheckbox.deselect(ud);
    });
  }

  @Output() selectionChanged = new EventEmitter();

  get selectionCount(): number {
    return this.tableSelectionCheckbox.selected.length;
  }

  get selectedUnitIds(): number[] {
    return this.tableSelectionCheckbox.selected.map(ud => ud.id);
  }

  set selectedUnitIds(newUnits: number[]) {
    if (this.selectionChangedSubscription) this.selectionChangedSubscription.unsubscribe();
    this.tableSelectionCheckbox.clear();
    this.objectsDatasource.data.forEach(row => {
      if (newUnits.includes(row.id)) this.tableSelectionCheckbox.select(row);
    });
    this.selectionChangedSubscription = this.tableSelectionCheckbox.changed.subscribe(() => {
      this.selectionChanged.emit();
    });
  }

  get selectedUnitKey(): string {
    const selectedUnits = this.tableSelectionCheckbox.selected;
    if (selectedUnits.length > 0) return selectedUnits[0].key;
    return '';
  }

  get selectedUnitName(): string {
    const selectedUnits = this.tableSelectionCheckbox.selected;
    if (selectedUnits.length > 0 && selectedUnits[0].name) return selectedUnits[0].name;
    return '';
  }

  @ViewChild(MatSort) sort = new MatSort();

  constructor(
    private backendService: BackendService
  ) { }

  ngOnInit() {
    this.selectionChangedSubscription = this.tableSelectionCheckbox.changed.subscribe(() => {
      this.selectionChanged.emit();
    });
  }

  isAllSelected(): boolean {
    const numSelected = this.tableSelectionCheckbox.selected.length;
    const numRows = this.objectsDatasource ? this.objectsDatasource.data.length : 0;
    return numSelected === numRows;
  }

  masterToggle(): void {
    this.isAllSelected() || !this.objectsDatasource ?
      this.tableSelectionCheckbox.clear() :
      this.objectsDatasource.data.forEach(row => this.tableSelectionCheckbox.select(row));
  }

  applyFilter(input: HTMLInputElement) {
    const filterValue = input.value;
    this.objectsDatasource.filter = filterValue.trim().toLowerCase();
  }

  ngOnDestroy(): void {
    if (this.selectionChangedSubscription) this.selectionChangedSubscription.unsubscribe();
  }
}
