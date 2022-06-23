import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../workspace.service';
import { AppService } from '../../app.service';
import { BackendService } from '../backend.service';

export interface SelectUnitData {
  title: string,
  buttonLabel: string,
  multiple: boolean
}

@Component({
  templateUrl: './select-unit.component.html'
})
export class SelectUnitComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox: SelectionModel <UnitInListDto>;

  constructor(
    private fb: FormBuilder,
    private bs: BackendService,
    private mds: AppService,
    private ds: WorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: SelectUnitData
  ) {
    this.tableSelectionCheckbox = new SelectionModel <UnitInListDto>(data.multiple, []);
  }

  ngOnInit(): void {
    this.objectsDatasource = new MatTableDataSource(this.ds.unitList.units());
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
}
