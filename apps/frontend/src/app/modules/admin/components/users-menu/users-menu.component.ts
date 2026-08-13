import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  MessageDialogComponent,
  MessageDialogData,
  MessageType
} from '@studio-lite-lib/iqb-components';
import { UserFullDto } from '@studio-lite-lib/api-dto';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { EditUserComponent } from '../edit-user/edit-user.component';
import { WrappedIconComponent } from '../../../../components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-users-menu',
  templateUrl: './users-menu.component.html',
  styleUrls: ['./users-menu.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class UsersMenuComponent {
  @Input() selectedUser!: number;

  // Counted on input instead of in the template: the admin list polls, so a template
  // expression over the session lists would re-run on every change detection cycle.
  @Input() set selectedRows(rows: UserFullDto[]) {
    this.rows = rows;
    this.orphanedSessionCount = rows.length === 1 ?
      (rows[0].sessions || []).filter(session => session.activityStatus === 'orphaned').length :
      0;
  }

  get selectedRows(): UserFullDto[] {
    return this.rows;
  }

  orphanedSessionCount = 0;

  private rows: UserFullDto[] = [];

  @Output() userAdded: EventEmitter<UntypedFormGroup> = new EventEmitter<UntypedFormGroup>();
  @Output() userEdited: EventEmitter<{ selection: UserFullDto[], user: UntypedFormGroup }> =
    new EventEmitter<{ selection: UserFullDto[], user: UntypedFormGroup }>();

  @Output() orphanedSessionsCleared: EventEmitter<void> = new EventEmitter<void>();

  constructor(private editUserDialog: MatDialog,
              private messsageDialog: MatDialog,
              private translateService: TranslateService) {}

  addUser(): void {
    const dialogRef = this.editUserDialog.open(EditUserComponent, {
      width: '600px',
      data: {
        newUser: true,
        isAdmin: false
      }
    });

    dialogRef.afterClosed().subscribe((result: boolean | UntypedFormGroup) => {
      if (typeof result !== 'undefined') {
        if (result !== false) {
          this.userAdded.emit(result as UntypedFormGroup);
        }
      }
    });
  }

  clearOrphanedSessions(): void {
    this.orphanedSessionsCleared.emit();
  }

  editUser(): void {
    const selectedRows = this.selectedRows;
    if (!selectedRows.length) {
      this.messsageDialog.open(MessageDialogComponent, {
        width: '400px',
        data: <MessageDialogData>{
          title: this.translateService.instant('admin.edit-user-data'),
          content: this.translateService.instant('admin.select-user'),
          type: MessageType.error
        }
      });
    } else {
      const dialogRef = this.editUserDialog.open(EditUserComponent, {
        width: '600px',
        data: {
          newUser: false,
          name: selectedRows[0].name,
          description: selectedRows[0].description,
          isAdmin: selectedRows[0].isAdmin,
          firstName: selectedRows[0].firstName,
          lastName: selectedRows[0].lastName,
          email: selectedRows[0].email,
          emailApproved: selectedRows[0].emailPublishApproved
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (typeof result !== 'undefined') {
          if (result !== false) {
            this.userEdited.emit({ selection: selectedRows, user: result as UntypedFormGroup });
          }
        }
      });
    }
  }
}
