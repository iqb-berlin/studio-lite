import {
  Component, EventEmitter, Input, Output
} from '@angular/core';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppService } from '../../../app.service';
import { BackendService } from '../../backend.service';
import { WorkspaceService } from '../../workspace.service';

@Component({
  selector: 'studio-lite-delete-review-button',
  templateUrl: './delete-review-button.component.html',
  styleUrls: ['./delete-review-button.component.scss']
})
export class DeleteReviewButtonComponent {
  @Input() selectedReviewId!: number;
  @Output() deleted: EventEmitter<null> = new EventEmitter<null>();
  @Output() selectionChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private confirmDiscardChangesDialog: MatDialog,
    public workspaceService: WorkspaceService
  ) {}

  deleteReview() {
    const dialogRef = this.confirmDiscardChangesDialog
      .open(ConfirmDialogComponent, {
        width: '400px',
        data: <ConfirmDialogData>{
          title: 'Aufgabenfolge löschen',
          content: 'Die aktuell ausgewählte Aufgabenfolge wird gelöscht. Fortsetzen?',
          confirmButtonLabel: 'Löschen',
          showCancel: true
        }
      });

    dialogRef.afterClosed()
      .subscribe(result => {
        if (result !== false) {
          this.selectionChanged.emit(false);
          this.appService.dataLoading = true;
          this.backendService.deleteReviews(
            this.workspaceService.selectedWorkspaceId,
            [this.selectedReviewId]
          ).subscribe(ok => {
            this.selectedReviewId = 0;
            this.appService.dataLoading = false;
            if (ok) {
              this.deleted.emit();
            } else {
              this.snackBar.open(
                'Konnte Aufgabenfolge nicht löschen', 'Fehler', { duration: 3000 }
              );
            }
          });
        }
      });
  }
}
