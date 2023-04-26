import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { WorkspaceSettings } from '../../models/workspace-settings.interface';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import {
  EditWorkspaceSettingsComponent
} from '../../../shared/components/edit-workspace-settings/edit-workspace-settings.component';

@Component({
  selector: 'studio-lite-workspace-menu',
  templateUrl: './workspace-menu.component.html',
  styleUrls: ['./workspace-menu.component.scss']
})
export class WorkspaceMenuComponent {
  @Input() selectedWorkspaceId!: number;
  @Input() selectedRows!: WorkspaceInListDto[];
  @Input() checkedRows!: WorkspaceInListDto[];

  @Output() workspaceAdded: EventEmitter<string> = new EventEmitter<string>();
  @Output() workspaceRenamed: EventEmitter<{ selection: WorkspaceInListDto[], name: string }> =
    new EventEmitter<{ selection: WorkspaceInListDto[], name: string }>();

  @Output() workspaceChanged: EventEmitter<{ selection: WorkspaceInListDto[], settings: WorkspaceSettings }> =
    new EventEmitter<{ selection: WorkspaceInListDto[], settings: WorkspaceSettings }>();

  @Output() workspaceNotLoaded: EventEmitter<void> = new EventEmitter<void>();
  @Output() workspaceDeleted: EventEmitter<WorkspaceInListDto[]> = new EventEmitter<WorkspaceInListDto[]>();
  @Output() download: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private editWorkspaceDialog: MatDialog,
    private editWorkspaceSettingsDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private messsageDialog: MatDialog,
    private appBackendService: AppBackendService,
    private translateService: TranslateService
  ) {}

  addObject(): void {
    const dialogRef = this.editWorkspaceDialog.open(InputTextComponent, {
      width: '600px',
      data: {
        title: this.translateService.instant('wsg-admin.new-workspace'),
        prompt: this.translateService.instant('wsg-admin.enter-name'),
        default: '',
        okButtonLabel: this.translateService.instant('wsg-admin.create')
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workspaceAdded.emit(result as string);
      }
    });
  }

  renameObject() {
    let selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      selectedRows = this.checkedRows;
    }
    if (selectedRows.length) {
      const dialogRef = this.editWorkspaceDialog.open(InputTextComponent, {
        width: '600px',
        data: {
          title: this.translateService.instant('wsg-admin.rename-workspace'),
          prompt: this.translateService.instant('wsg-admin.enter-name'),
          default: selectedRows[0].name,
          okButtonLabel: this.translateService.instant('save')
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.workspaceRenamed.emit({
            selection: selectedRows,
            name: result as string
          });
        }
      });
    }
  }

  changeObject(): void {
    let selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      selectedRows = this.checkedRows;
    }
    if (selectedRows.length) {
      this.appBackendService.getWorkspaceData(selectedRows[0].id).subscribe(
        wResponse => {
          if (wResponse) {
            const wsSettings = wResponse.settings || {
              defaultEditor: '',
              defaultPlayer: '',
              defaultSchemer: '',
              unitGroups: [],
              stableModulesOnly: true
            };
            const dialogRef = this.editWorkspaceSettingsDialog.open(EditWorkspaceSettingsComponent, {
              width: '600px',
              data: wsSettings
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.workspaceChanged.emit({ selection: selectedRows, settings: result });
              }
            });
          } else {
            this.workspaceNotLoaded.emit();
          }
        }
      );
    }
  }

  deleteObject(): void {
    let selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      selectedRows = this.checkedRows;
    }
    if (selectedRows.length) {
      const prompt = selectedRows.length === 1 ?
        this.translateService.instant('wsg-admin.delete-workspace', { name: selectedRows[0].name }) :
        this.translateService.instant('wsg-admin.delete-workspaces', { count: selectedRows.length });
      const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: this.translateService.instant('wsg-admin.deleting-of-workspaces'),
          content: prompt,
          confirmButtonLabel: this.translateService.instant('delete'),
          showCancel: true
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.workspaceDeleted.emit(selectedRows);
        }
      });
    }
  }
}
