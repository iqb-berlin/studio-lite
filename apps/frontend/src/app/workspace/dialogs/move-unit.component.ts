import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AppService } from '../../app.service';
import { WorkspaceDataFlat } from '../../app.classes';
import { SelectUnitListComponent } from './select-unit-list/select-unit-list.component';

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
        <select-unit-list #unitSelectionTable [workspace]="data.currentWorkspaceId"></select-unit-list>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-raised-button color="primary" type="submit" [mat-dialog-close]="true" [disabled]="unitSelectionTable.selectionCount === 0 || selectForm.invalid">
          {{data.buttonLabel}}</button>
        <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
      </mat-dialog-actions>
    </div>
  `
})
export class MoveUnitComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  workspaceList: WorkspaceDataFlat[] = [];
  selectForm: FormGroup;
  get selectedUnits(): number[] {
    return this.unitSelectionTable ? this.unitSelectionTable.selectedUnitIds : []
  }
  get targetWorkspace(): number {
    const selectorControl = this.selectForm.get('wsSelector');
    return selectorControl ? selectorControl.value : 0
  }

  constructor(
    private fb: FormBuilder,
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
