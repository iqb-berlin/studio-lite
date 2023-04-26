import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, OnInit, Inject, ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { WorkspaceDataFlat } from '../../../../models/workspace-data-flat.interface';

export interface SelectUnitData {
  title: string,
  buttonLabel: string,
  fromOtherWorkspacesToo: boolean,
  multiple: boolean
}

@Component({
  selector: 'studio-lite-select-unit',
  templateUrl: './select-unit.component.html',
  styleUrls: ['./select-unit.component.scss']
})
export class SelectUnitComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  workspaceList: WorkspaceDataFlat[] = [];
  selectForm: UntypedFormGroup | null = null;
  get selectedUnitIds(): number[] {
    return this.unitSelectionTable ? this.unitSelectionTable.selectedUnitIds : [];
  }

  get selectedUnitKey(): string {
    return this.unitSelectionTable ? this.unitSelectionTable.selectedUnitKey : '';
  }

  get selectedUnitName(): string {
    return this.unitSelectionTable ? this.unitSelectionTable.selectedUnitName : '';
  }

  constructor(
    private fb: UntypedFormBuilder,
    private backendService: BackendService,
    private appService: AppService,
    public ds: WorkspaceService,
    @Inject(MAT_DIALOG_DATA) public data: SelectUnitData
  ) {
    if (this.data.fromOtherWorkspacesToo) {
      this.selectForm = this.fb.group({ wsSelector: this.fb.control(this.ds.selectedWorkspaceId) });
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
  }

  updateWorkspace(newWorkspaceId: number) {
    if (this.unitSelectionTable) this.unitSelectionTable.workspaceId = newWorkspaceId;
  }
}
