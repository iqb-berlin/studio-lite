import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import { UntypedFormGroup } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { EditWorkspaceGroupComponent } from '../edit-workspace-group/edit-workspace-group.component';
import {
  EditWorkspaceGroupSettingsComponent
} from '../edit-workspace-group-settings/edit-workspace-group-settings.component';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-workspace-groups-menu',
  templateUrl: './workspace-groups-menu.component.html',
  styleUrls: ['./workspace-groups-menu.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class WorkspaceGroupsMenuComponent {
  @Input() selectedWorkspaceGroupId!: number;
  @Input() selectedRows!: WorkspaceGroupInListDto[];
  @Output() groupAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
  @Output() groupSettingsEdited = new EventEmitter();
  @Output() groupEdited: EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }> =
    new EventEmitter<{ selection: WorkspaceGroupInListDto[], group: UntypedFormGroup }>();

  constructor(
    public backendService: BackendService,
    public workspaceService: WorkspaceService,
    private editWorkspaceDialog: MatDialog,
    private translateService: TranslateService) {}

  addGroup(): void {
    const dialogRef = this.editWorkspaceDialog.open(EditWorkspaceGroupComponent, {
      width: '600px',
      data: {
        wsg: {
          name: ''
        },
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
    if (this.selectedRows.length) {
      const dialogRef = this.editWorkspaceDialog.open(EditWorkspaceGroupComponent, {
        width: '600px',
        data: {
          wsg: this.selectedRows[0],
          title: this.translateService.instant('admin.edit-group'),
          saveButtonLabel: this.translateService.instant('save')

        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.groupEdited.emit({ selection: this.selectedRows, group: result as UntypedFormGroup });
          }
        }
      });
    }
  }

  async editGroupSettings(): Promise<void> {
    if (this.selectedRows.length) {
      const dialogRef = this.editWorkspaceDialog
        .open(EditWorkspaceGroupSettingsComponent, {
          width: '600px',
          height: '80%',
          data: {
            wsg: this.selectedRows[0],
            title: this.translateService.instant('admin.edit-group-settings'),
            saveButtonLabel: this.translateService.instant('save')
          }
        });
      dialogRef.afterClosed().subscribe(data => {
        if (typeof data !== 'undefined') {
          if (data !== false) {
            this.groupSettingsEdited
              .emit({ states: data.states, profiles: data.profilesSelected, selectedRow: this.selectedRows[0].id });
          }
        }
      });
    }
  }
}
