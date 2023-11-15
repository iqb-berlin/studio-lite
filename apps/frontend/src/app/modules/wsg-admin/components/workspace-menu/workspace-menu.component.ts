import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WorkspaceGroupFullDto, WorkspaceInListDto } from '@studio-lite-lib/api-dto';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { BackendService } from '../../services/backend.service';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { WorkspaceSettings } from '../../models/workspace-settings.interface';
import { BackendService as AppBackendService } from '../../../../services/backend.service';
import { MoveWorkspaceComponent } from '../../../shared/components/move-workspace/move-workspace.component';
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
  @Output() workspaceMoved: EventEmitter<{ selection: WorkspaceInListDto[], workspaceGroupId: number }> =
    new EventEmitter<{ selection: WorkspaceInListDto[], workspaceGroupId: number }>();

  constructor(
    private moveWorkspaceDialog: MatDialog,
    private editWorkspaceDialog: MatDialog,
    private editWorkspaceSettingsDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private backendService: BackendService,
    private appBackendService: AppBackendService,
    private translateService: TranslateService
  ) {}

  workspaceGroupsByUser: WorkspaceGroupFullDto[] | null = [];
  userId:number = 0;

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

  moveObject() {
    let selectedRows = this.selectedRows;
    if (selectedRows.length === 0) {
      selectedRows = this.checkedRows;
    }
    this.appBackendService.getAuthData().subscribe(user => {
      this.backendService.getWorkspaceGroupsByUser(user.userId).subscribe(dat => {
        this.workspaceGroupsByUser = dat;
        if (this.workspaceGroupsByUser && this.workspaceGroupsByUser.length > 1) {
          let prompt;
          if (selectedRows.length === 1) {
            prompt = this.translateService.instant('wsg-admin.move-workspace-with-units', {
              name: selectedRows[0].name
            });
          } else {
            prompt = this.translateService
              .instant('wsg-admin.move-workspaces', { count: selectedRows.length });
          }
          const dialogRef = this.moveWorkspaceDialog.open(MoveWorkspaceComponent, {
            width: '600px',
            data: {
              title: this.translateService.instant('wsg-admin.moving-of-workspaces'),
              content: prompt,
              warning: this.translateService.instant('wsg-admin.move-workspaces-warning'),
              workspaceGroups: this.workspaceGroupsByUser,
              selectedRows: selectedRows,
              okButtonLabel: this.translateService.instant('move')
            }
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.workspaceMoved.emit({
                selection: selectedRows,
                workspaceGroupId: result as number
              });
            }
          });
        } else {
          this.moveWorkspaceDialog.open(MoveWorkspaceComponent, {
            width: '600px',
            data: {
              title: this.translateService.instant('wsg-admin.moving-of-workspaces'),
              content: this.translateService.instant('wsg-admin.move-workspaces-no-workspace-groups-hint'),
              warning: this.translateService.instant('move-workspaces-warning'),
              workspaceGroups: this.workspaceGroupsByUser,
              okButtonLabel: this.translateService.instant('close')
            }
          });
        }
      });
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
              stableModulesOnly: true,
              profile: ''
            };
            const dialogRef = this.editWorkspaceSettingsDialog.open(EditWorkspaceSettingsComponent, {
              width: '600px',
              data: { settings: wsSettings, selectedRow: selectedRows[0].id }
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
      let prompt;
      if (selectedRows.length === 1) {
        prompt = (selectedRows[0].unitsCount) ?
          this.translateService
            .instant('wsg-admin.delete-workspace-with-units', { name: selectedRows[0].name }) :
          this.translateService
            .instant('wsg-admin.delete-workspace', { name: selectedRows[0].name });
      } else {
        prompt = this.translateService
          .instant('wsg-admin.delete-workspaces', { count: selectedRows.length });
      }
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
