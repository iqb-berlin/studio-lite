import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, Inject, OnInit, ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppService } from '../../../../services/app.service';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { WorkspaceDataFlat } from '../../../../models/workspace-data-flat.interface';
import { MoveUnitData } from '../../models/move-unit-data.interface';

@Component({
  selector: 'studio-lite-move-unit',
  templateUrl: './move-unit.component.html',
  styleUrls: ['./move-unit.component.scss']
})

export class MoveUnitComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  workspaceList: WorkspaceDataFlat[] = [];
  selectForm: UntypedFormGroup;
  get selectedUnits(): number[] {
    return this.unitSelectionTable ? this.unitSelectionTable.selectedUnitIds : [];
  }

  get targetWorkspace(): number {
    const selectorControl = this.selectForm.get('wsSelector');
    return selectorControl ? selectorControl.value : 0;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: MoveUnitData
  ) {
    this.selectForm = this.fb.group({
      wsSelector: this.fb.control(0, [Validators.required, Validators.min(1)])
    });
  }

  ngOnInit(): void {
    if (this.appService.authData.userId > 0) {
      this.appService.authData.workspaces.forEach(wsg => {
        wsg.workspaces.forEach(ws => {
          if (ws.id !== this.data.currentWorkspaceId) {
            this.workspaceList.push(<WorkspaceDataFlat>{
              id: ws.id,
              name: ws.name,
              groupId: wsg.id,
              groupName: wsg.name
            });
          }
        });
      });
    }
  }
}
