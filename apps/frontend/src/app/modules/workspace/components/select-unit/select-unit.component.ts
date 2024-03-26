import {
  MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {
  Component, OnInit, Inject, ViewChild
} from '@angular/core';
import {
  UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField } from '@angular/material/form-field';
import { NgIf, NgFor } from '@angular/common';
import { WorkspaceDataFlat } from '../../../../models/workspace-data-flat.interface';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { AppService } from '../../../../services/app.service';
import { WorkspaceService } from '../../services/workspace.service';

export interface SelectUnitData {
  title: string;
  buttonLabel: string;
  fromOtherWorkspacesToo: boolean;
  multiple: boolean;
  selectedUnitId: number;
}

@Component({
  selector: 'studio-lite-select-unit',
  templateUrl: './select-unit.component.html',
  styleUrls: ['./select-unit.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, NgIf, FormsModule, ReactiveFormsModule, MatFormField, MatSelect, NgFor, MatOption, MatDialogContent, SelectUnitListComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
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
