import {Component, Input} from '@angular/core';
import {BackendService} from "../../backend.service";
import {MatTableDataSource} from "@angular/material/table";
import {UnitInListDto} from "@studio-lite-lib/api-dto";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
  selector: 'select-unit-list',
  template: `
    <div fxLayout="column" class="unit-list-wrapper">
      <div *ngIf="multipleSelection">
        <p *ngIf="selectionCount === 0">Bitte Aufgaben auswählen!</p>
        <p *ngIf="selectionCount === 1">Eine Aufgabe ausgewählt.</p>
        <p *ngIf="selectionCount > 1">{{selectionCount}} Aufgaben ausgewählt.</p>
      </div>
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

        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef mat-sort-header> Aufgabe </mat-header-cell>
          <mat-cell *matCellDef="let element"
                    [class]="(disabledUnits.indexOf(element.id) >= 0) ? 'disabled-element' : ''">
            {{element.key}}{{element.name ? ' - ' + element.name : ''}}
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
export class SelectUnitListComponent {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitInListDto>(true, []);
  disabledUnits: number[] = [];
  @Input('workspace')
  set workspaceId(value: number) {
    this.tableSelectionCheckbox.clear();
    this.backendService.getUnitList(value).subscribe(unitData => {
      this.objectsDatasource = new MatTableDataSource(unitData);
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
    console.log(value);
    this.disabledUnits = value;
    this.objectsDatasource.data.forEach(ud => {
      if (this.disabledUnits.indexOf(ud.id) >= 0) this.tableSelectionCheckbox.deselect(ud);
    });
  }
  get selectionCount(): number {
    return this.tableSelectionCheckbox.selected.length
  }
  get selectedUnitIds(): number[] {
    return this.tableSelectionCheckbox.selected.map(ud => ud.id)
  }
  get selectedUnitKey(): string {
    const selectedUnits = this.tableSelectionCheckbox.selected;
    if (selectedUnits.length > 0) return selectedUnits[0].key;
    return ''
  }
  get selectedUnitName(): string {
    const selectedUnits = this.tableSelectionCheckbox.selected;
    if (selectedUnits.length > 0 && selectedUnits[0].name) return selectedUnits[0].name;
    return ''
  }

  constructor(
    private backendService: BackendService,
  ) { }

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
}
