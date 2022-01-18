import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackendService, UnitShortData } from '../backend.service';
import { MainDatastoreService } from '../../maindatastore.service';
import { DatastoreService } from '../datastore.service';
import { WorkspaceData } from '../../backend.service';

@Component({
  templateUrl: './moveunit.component.html'
})
export class MoveUnitComponent implements OnInit {
  dataLoading = false;
  objectsDatasource = new MatTableDataSource<UnitShortData>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox = new SelectionModel <UnitShortData>(true, []);
  workspaceList: WorkspaceData[] = [];
  selectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private mds: MainDatastoreService,
    private ds: DatastoreService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectForm = this.fb.group({
      wsSelector: this.fb.control(0, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    if (this.mds.loginStatus) {
      this.mds.loginStatus.workspaces.forEach(ws => {
        if (ws.id !== this.data.currentWorkspaceId) {
          this.workspaceList.push(ws);
        }
      });
    }
    this.objectsDatasource = new MatTableDataSource(this.ds.unitList);
    this.tableSelectionCheckbox.clear();
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
