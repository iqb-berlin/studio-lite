import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { WorkspaceService } from '../../services/workspace.service';
import { BackendService as AppBackendService } from '../../../../services/backend.service';

@Component({
    selector: 'studio-lite-new-group-button',
    templateUrl: './new-group-button.component.html',
    styleUrls: ['./new-group-button.component.scss'],
    imports: [MatIconButton, MatTooltip, MatIcon, TranslateModule]
})
export class NewGroupButtonComponent {
  constructor(
    private inputTextDialog: MatDialog,
    public workspaceService: WorkspaceService,
    private appBackendService: AppBackendService,
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  @Input() disabled!: boolean;
  @Output() groupNameChange: EventEmitter<string> = new EventEmitter<string>();

  newGroup() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: this.translateService.instant('workspace.new-group'),
        default: '',
        okButtonLabel: this.translateService.instant('workspace.save'),
        prompt: this.translateService.instant('workspace.group-name')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (!this.workspaceService.workspaceSettings.unitGroups) {
          this.workspaceService.workspaceSettings.unitGroups = [];
        }
        if (this.workspaceService.workspaceSettings.unitGroups.indexOf(result) < 0) {
          this.workspaceService.workspaceSettings.unitGroups.push(result);
          this.appBackendService.setWorkspaceSettings(
            this.workspaceService.selectedWorkspaceId, this.workspaceService.workspaceSettings
          ).subscribe(isOK => {
            if (!isOK) {
              this.snackBar.open(
                this.translateService.instant('workspace.group-not-saved'),
                this.translateService.instant('workspace.error'),
                { duration: 3000 });
            } else {
              this.snackBar.open(
                this.translateService.instant('workspace.group-saved'),
                '',
                { duration: 1000 });
              this.groupNameChange.emit(result);
            }
          });
        }
      }
    });
  }
}
