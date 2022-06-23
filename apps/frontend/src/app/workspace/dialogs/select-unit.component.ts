import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitInListDto } from '@studio-lite-lib/api-dto';
import { WorkspaceService } from '../workspace.service';
import { AppService } from '../../app.service';
import { BackendService } from '../backend.service';
import { WorkspaceDataFlat } from '../../app.classes';

export interface SelectUnitData {
  title: string,
  buttonLabel: string,
  fromOtherWorkspacesToo: boolean,
  multiple: boolean
}

@Component({
  templateUrl: './select-unit.component.html'
})
export class SelectUnitComponent implements OnInit {
  objectsDatasource = new MatTableDataSource<UnitInListDto>();
  displayedColumns = ['selectCheckbox', 'name'];
  tableSelectionCheckbox: SelectionModel <UnitInListDto>;
  workspaceList: WorkspaceDataFlat[] = [];
  selectForm: FormGroup | null = null;

  constructor(
    private fb: FormBuilder,
    private backendService: BackendService,
    private appService: AppService,
    private ds: WorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: SelectUnitData
  ) {
    this.tableSelectionCheckbox = new SelectionModel <UnitInListDto>(data.multiple, []);
    if (this.data.fromOtherWorkspacesToo) {
      this.selectForm = this.fb.group({wsSelector: this.fb.control(this.ds.selectedWorkspace)});
    }
  }

  ngOnInit(): void {
    if (this.data.fromOtherWorkspacesToo && this.appService.authData.userId > 0) {
      this.appService.authData.workspaces.forEach(wsg => {
        wsg.workspaces.forEach(ws => {
          this.workspaceList.push(<WorkspaceDataFlat>{
            id: ws.id,
            name: ws.name,
            groupId: wsg.id,
            groupName: wsg.name
          });
        });
      });
    }
    this.updateUnitList()
  }

  updateUnitList() {
    this.appService.dataLoading = true;
    let myWorkspace = this.ds.selectedWorkspace;
    if (this.data.fromOtherWorkspacesToo && this.selectForm) {
      const wsSelectControl = this.selectForm.get('wsSelector');
      if (wsSelectControl) myWorkspace = wsSelectControl.value;
    }
    this.backendService.getUnitList(myWorkspace).subscribe(md => {
      this.objectsDatasource = new MatTableDataSource(md);
      this.appService.dataLoading = false;
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
}
