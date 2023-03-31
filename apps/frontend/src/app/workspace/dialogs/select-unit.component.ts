import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  Component, OnInit, Inject, ViewChild
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { WorkspaceService } from '../services/workspace.service';
import { AppService } from '../../app.service';
import { BackendService } from '../services/backend.service';
import { WorkspaceDataFlat } from '../../app.classes';
import { SelectUnitListComponent } from '../components/select-unit-list/select-unit-list.component';

export interface SelectUnitData {
  title: string,
  buttonLabel: string,
  fromOtherWorkspacesToo: boolean,
  multiple: boolean
}

@Component({
  template: `
      <div fxLayout="column" style="height: 100%">
          <h1 mat-dialog-title>{{ data.title }}</h1>
          <form [formGroup]="selectForm" *ngIf="selectForm" fxLayout="column">
              <mat-form-field>
                  <mat-select placeholder="Arbeitsbereich" formControlName="wsSelector"
                              (selectionChange)="updateWorkspace($event.value)">
                      <mat-option *ngFor="let ws of workspaceList" [value]="ws.id">
                          {{ws.groupName}}: {{ws.name}}
                      </mat-option>
                  </mat-select>
              </mat-form-field>
          </form>
          <mat-dialog-content>
              <studio-lite-select-unit-list #unitSelectionTable [workspace]="ds.selectedWorkspaceId"
                                [multiple]="data.multiple"></studio-lite-select-unit-list>
          </mat-dialog-content>

          <mat-dialog-actions>
              <button mat-raised-button color="primary" type="submit"
                      [mat-dialog-close]="true"
                      [disabled]="unitSelectionTable.selectionCount === 0">
                  {{data.buttonLabel}}</button>
              <button mat-raised-button [mat-dialog-close]="false">Abbrechen</button>
          </mat-dialog-actions>
      </div>
  `
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
