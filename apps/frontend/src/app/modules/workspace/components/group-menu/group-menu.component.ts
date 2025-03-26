import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-group-menu',
  templateUrl: './group-menu.component.html',
  styleUrls: ['./group-menu.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class GroupMenuComponent {
  @Input() selectedGroup!: string;

  @Output() groupAdded: EventEmitter<string> = new EventEmitter<string>();
  @Output() groupRenamed: EventEmitter<string> = new EventEmitter<string>();
  @Output() groupDeleted: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private messageDialog: MatDialog,
    private inputTextDialog: MatDialog,
    private deleteConfirmDialog: MatDialog,
    private translateService: TranslateService
  ) {}

  addGroup() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: this.translateService.instant('workspace.new-unit-group'),
        default: '',
        okButtonLabel: this.translateService.instant('save'),
        prompt: this.translateService.instant('workspace.group-name')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (result.length > 1) {
          this.groupAdded.emit(result);
        }
      }
    });
  }

  renameGroup() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: this.translateService.instant('workspace.rename-unit-group'),
        default: this.selectedGroup,
        okButtonLabel: this.translateService.instant('save'),
        prompt: this.translateService.instant('workspace.group-name')
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (result.length > 1) {
          this.groupRenamed.emit(result);
        }
      }
    });
  }

  deleteGroup() {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: this.translateService.instant('workspace.delete-unit-group'),
        content: this.translateService
          .instant('workspace.confirm-delete-unit-group', { group: this.selectedGroup }),
        confirmButtonLabel: this.translateService.instant('delete'),
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupDeleted.emit();
      }
    });
  }
}
