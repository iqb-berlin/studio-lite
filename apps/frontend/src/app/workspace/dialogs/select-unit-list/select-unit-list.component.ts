import {Component, Input} from '@angular/core';
import {BackendService} from "../../backend.service";
import {MatTableDataSource} from "@angular/material/table";
import {UnitInListDto} from "@studio-lite-lib/api-dto";
import {SelectionModel} from "@angular/cdk/collections";

@Component({
  selector: 'select-unit-list',
  template: `
    <mat-table [dataSource]="objectsDatasource" matSort>
      <ng-container matColumnDef="selectCheckbox">
        <mat-header-cell *matHeaderCellDef fxFlex="70px">
          <mat-checkbox (change)="$event ? masterToggle() : null"
                        [checked]="tableSelectionCheckbox.hasValue() && isAllSelected()"
                        [indeterminate]="tableSelectionCheckbox.hasValue() && !isAllSelected()">
          </mat-checkbox>
        </mat-header-cell>
        <mat-cell *matCellDef="let row" fxFlex="70px">
          <mat-checkbox (click)="$event.stopPropagation()"
                        (change)="$event ? tableSelectionCheckbox.toggle(row) : null"
                        [checked]="tableSelectionCheckbox.isSelected(row)">
          </mat-checkbox>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef mat-sort-header> Aufgabe </mat-header-cell>
        <mat-cell *matCellDef="let element"> {{element.key}}-{{element.name}} </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>
  `
})
export class SelectUnitListComponent {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitInListDto>(true, []);
  @Input('workspace')
  set workspaceId(value: number) {
    this.tableSelectionCheckbox.clear();
    this.backendService.getUnitList(value).subscribe(unitData => {
      this.objectsDatasource = new MatTableDataSource(unitData);
    });
  }
  get selectionCount(): number {
    return this.tableSelectionCheckbox.selected.length
  }
  get selectedUnits(): number[] {
    return this.tableSelectionCheckbox.selected.map(ud => ud.id)
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
