import { Directive } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[studioLiteCheckForChanges]',
  standalone: false
})
export abstract class CheckForChangesDirective {
  protected abstract confirmDiscardChangesDialog: MatDialog;
  protected abstract translateService: TranslateService;

  async checkForChangesAndContinue(changed: boolean): Promise<boolean> {
    if (!changed) return true;
    const dialogResult = await lastValueFrom(this.confirmDiscardChangesDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: this.translateService.instant('workspace.reject-changes'),
          content: this.translateService.instant('workspace.reject-review-continue'),
          confirmButtonLabel: this.translateService.instant('workspace.reject'),
          showCancel: true
        }
      }).afterClosed());
    return dialogResult !== false;
  }
}
