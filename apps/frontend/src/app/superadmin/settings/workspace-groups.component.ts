import { Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService, WorkspaceGroupData } from '../backend.service';
import { EditWorkspaceGroupComponent } from './edit-workspace-group.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'app-workspace-groups',
  template: `
    <mat-form-field class="example-chip-list">
      <mat-label>Arbeitsbereiche - Gruppen</mat-label>
      <mat-chip-list #chipList>
        <mat-chip *ngFor="let wsg of workspaceGroups" (click)="changeName(wsg)" [matBadge]="wsg.ws_count"
                  [removable]="wsg.ws_count === 0" (removed)="deleteWorkspaceGroup(wsg)"
                  [matBadgeHidden]="wsg.ws_count === 0">
          {{wsg.label}}
          <mat-icon matChipRemove *ngIf="wsg.ws_count === 0">cancel</mat-icon>
        </mat-chip><br/>
        <input placeholder="Neue Gruppe..."
               [matChipInputFor]="chipList"
               [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
               [matChipInputAddOnBlur]="addOnBlur"
               (matChipInputTokenEnd)="add($event)">
      </mat-chip-list>
    </mat-form-field>
  `,
  styles: ['.example-chip-list {width: 100%;}']
})
export class WorkspaceGroupsComponent implements OnInit {
  workspaceGroups: WorkspaceGroupData[] = [];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = false;

  constructor(
    private editWorkspaceGroupDialog: MatDialog,
    private snackBar: MatSnackBar,
    private bs: BackendService
  ) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.updateList();
    });
  }

  updateList(): void {
    this.bs.getWorkspaceGroupList().subscribe(wsGroups => {
      this.workspaceGroups = wsGroups;
    },
    () => {
      this.workspaceGroups = [];
    });
  }

  changeName(wsg: WorkspaceGroupData): void {
    const dialogRef = this.editWorkspaceGroupDialog.open(EditWorkspaceGroupComponent, {
      width: '600px',
      data: {
        name: wsg.label
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.bs.renameWorkspaceGroup(
            wsg.id,
            (<FormGroup>result).get('name')?.value
          ).subscribe(
            respOk => {
              if (respOk) {
                this.updateList();
              } else {
                this.snackBar.open('Konnte Gruppe nicht ändern', 'Fehler', { duration: 3000 });
              }
            },
            err => {
              this.snackBar.open(`Konnte Gruppe nicht ändern (${err.code})`, 'Fehler', { duration: 3000 });
            }
          );
        }
      }
    });
  }

  deleteWorkspaceGroup(wsg: WorkspaceGroupData): void {
    this.bs.deleteWorkspaceGroup(wsg.id).subscribe(() => this.updateList());
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.bs.addWorkspaceGroup(value.trim()).subscribe(() => this.updateList());
    }

    if (input) input.value = '';
  }
}
