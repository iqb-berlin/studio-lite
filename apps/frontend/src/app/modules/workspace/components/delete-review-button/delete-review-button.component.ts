import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButton } from '@angular/material/button';
import { AppService } from '../../../../services/app.service';
import { BackendService } from '../../services/backend.service';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

@Component({
  selector: 'studio-lite-delete-review-button',
  templateUrl: './delete-review-button.component.html',
  styleUrls: ['./delete-review-button.component.scss'],
  imports: [MatButton, MatTooltip, WrappedIconComponent, TranslateModule]
})
export class DeleteReviewButtonComponent {
  @Input() selectedReviewId!: number;
  @Input() workspaceId!: number;
  @Output() deleted: EventEmitter<null> = new EventEmitter<null>();
  @Output() changedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    protected translateService: TranslateService,
    private confirmDiscardChangesDialog: MatDialog
  ) {}

  deleteReview() {
    const dialogRef = this.confirmDiscardChangesDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: this.translateService.instant('workspace.delete-review'),
          content: this.translateService.instant('workspace.delete-review-continue'),
          confirmButtonLabel: this.translateService.instant('workspace.delete'),
          showCancel: true
        }
      });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result !== false) {
          this.changedChange.emit(false);
          this.appService.dataLoading = true;
          this.backendService.deleteReview(
            this.workspaceId,
            this.selectedReviewId
          ).subscribe(ok => {
            this.selectedReviewId = 0;
            this.appService.dataLoading = false;
            if (ok) {
              this.deleted.emit();
            } else {
              this.snackBar
                .open(this.translateService.instant('workspace.review-not-deleted'),
                  this.translateService.instant('workspace.error'),
                  { duration: 3000 });
            }
          });
        }
      });
  }
}
