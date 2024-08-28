import { Directive } from '@angular/core';
import { RequestReportDto } from '@studio-lite-lib/api-dto';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestMessageComponent } from '../../../components/request-message/request-message.component';
import { WorkspaceService } from '../services/workspace.service';
import { BackendService } from '../services/backend.service';
import { SelectUnitDirective } from './select-unit.directive';

@Directive()
export abstract class RequestMessageDirective extends SelectUnitDirective {
  abstract override workspaceService: WorkspaceService;
  abstract selectUnitDialog: MatDialog;
  abstract override backendService: BackendService;
  abstract translateService: TranslateService;
  abstract snackBar: MatSnackBar;
  abstract uploadReportDialog: MatDialog;

  showRequestMessage(
    uploadStatus: boolean | RequestReportDto,
    errorKey: string,
    successKey: string
  ): void {
    if (typeof uploadStatus === 'boolean') {
      this.snackBar.open(
        this.translateService.instant(errorKey),
        this.translateService.instant('workspace.error'),
        { duration: 3000 }
      );
    } else if (uploadStatus.messages && uploadStatus.messages.length) {
      const dialogRef2 = this.uploadReportDialog.open(RequestMessageComponent, {
        width: '500px',
        data: uploadStatus
      });
      dialogRef2.afterClosed()
        .subscribe(() => {
          this.updateUnitList();
        });
    } else {
      this.snackBar.open(
        this.translateService.instant(successKey),
        '',
        { duration: 5000 }
      );
      this.updateUnitList();
    }
  }
}
