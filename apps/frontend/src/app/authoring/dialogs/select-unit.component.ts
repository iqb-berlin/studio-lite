import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DatastoreService } from '../datastore.service';
import { MainDatastoreService } from '../../maindatastore.service';
import { BackendService, UnitShortData } from '../backend.service';

@Component({
  templateUrl: './select-unit.component.html'
})
export class SelectUnitComponent implements OnInit {
  dataLoading = false;
  objectsDatasource = new MatTableDataSource<UnitShortData>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitShortData>(true, []);

  constructor(
    private fb: FormBuilder,
    private bs: BackendService,
    private mds: MainDatastoreService,
    private ds: DatastoreService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.objectsDatasource = new MatTableDataSource(this.ds.unitList);
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
