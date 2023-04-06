import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, Inject, OnInit, ViewChild
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { AppService } from '../../services/app.service';
import { SelectUnitListComponent } from '../components/select-unit-list/select-unit-list.component';
import { WorkspaceDataFlat } from '../../classes/workspace-data-flat.class';

export interface MoveUnitData {
  title: string,
  buttonLabel: string,
  currentWorkspaceId: number
}

@Component({
  template: `
    <div fxLayout="column" style="height: 100%">
      <h1 mat-dialog-title>{{ data.title }}</h1>
      <form [formGroup]="selectForm" fxLayout="column">
        <mat-form-field>
          <mat-select placeholder="Ziel-Arbeitsbereich" formControlName="wsSelector">
            <mat-option *ngFor="let ws of workspaceList" [value]="ws.id">
              {{ws.groupName}}: {{ws.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </form>
      <mat-dialog-content fxFlex>
        <studio-lite-select-unit-list
          #unitSelectionTable
          [workspace]="data.currentWorkspaceId">
        </studio-lite-select-unit-list>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit"
                [mat-dialog-close]="true" [disabled]="unitSelectionTable.selectionCount === 0 || selectForm.invalid">
          {{data.buttonLabel}}</button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `
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
