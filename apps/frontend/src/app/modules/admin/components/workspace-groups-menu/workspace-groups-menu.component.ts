import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { UntypedFormGroup } from '@angular/forms';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { EditWorkspaceGroupComponent } from '../edit-workspace-group/edit-workspace-group.component';

@Component({
  selector: 'studio-lite-workspace-groups-menu',
  templateUrl: './workspace-groups-menu.component.html',
  styleUrls: ['./workspace-groups-menu.component.scss']
})
export class WorkspaceGroupsMenuComponent {
  @Input() selectedWorkspaceGroupId!: number;
  @Input() selectedRows!: WorkspaceGroupInListDto[];
  @Input() checkedRows!: WorkspaceGroupInListDto[];

  @Output() downloadWorkspacesReport: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() groupAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
  @Output() groupsDeleted: EventEmitter< WorkspaceGroupInListDto[]> = new EventEmitter< WorkspaceGroupInListDto[]>();
  @Output() groupEdited: EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }> =
    new EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }>();

  constructor(private editWorkspaceDialog: MatDialog,
              private deleteConfirmDialog: MatDialog,
              private translateService: TranslateService) {}

  addGroup(): void {
    const dialogRef = this.editWorkspaceDialog.open(EditWorkspaceGroupComponent, {
      width: '600px',
      data: {
        name: '',
        title: this.translateService.instant('admin.new-group'),
        saveButtonLabel: this.translateService.instant('create')
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean | UntypedFormGroup) => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.groupAdded.emit(result as UntypedFormGroup);
        }
      }
    });
  }

  editGroup(): void {
    let selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      selectedRows = this.checkedRows;
    }
    if (selectedRows.length) {
      const dialogRef = this.editWorkspaceDialog.open(EditWorkspaceGroupComponent, {
        width: '600px',
        data: {
          name: selectedRows[0].name,
          title: this.translateService.instant('admin.edit-group'),
          saveButtonLabel: this.translateService.instant('save')
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.groupEdited.emit({ selection: selectedRows, group: result as UntypedFormGroup });
          }
        }
      });
    }
  }

  deleteGroups(): void {
    let selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      selectedRows = this.checkedRows;
    }
    if (selectedRows.length) {
      const content = (selectedRows.length === 1) ?
        this.translateService.instant('admin.delete-group', { name: selectedRows[0].name }) :
        this.translateService.instant('admin.delete-groups', { count: selectedRows.length });
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: this.translateService.instant('admin.delete-groups-title'),
          content: content,
          confirmButtonLabel: this.translateService.instant('delete'),
          showCancel: true
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.groupsDeleted.emit(selectedRows);
        }
      });
    }
  }
}
