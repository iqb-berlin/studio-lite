import { Component, OnInit, ViewChild } from '@angular/core';
import { ReviewFullDto, ReviewInListDto } from '@studio-lite-lib/api-dto';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
  MessageDialogComponent,
  MessageDialogData, MessageType
} from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../backend.service';
import { WorkspaceService } from '../workspace.service';
import { SelectUnitListComponent } from './components/select-unit-list.component';
import { AppService } from '../../app.service';
import { InputTextComponent } from '../../components/input-text.component';

@Component({
  templateUrl: './reviews.component.html',
  styles: [
    '.margin-bottom {margin-bottom: 10px}',
    '.tcMessage {font-style: italic; font-size: smaller}',
    '.selected {background-color: #3957f74f}',
    '.review-list {overflow: auto; background-color: whitesmoke; border: 2px solid whitesmoke}',
    '.review-list-entry {overflow: hidden; text-overflow: ellipsis;white-space: nowrap;font-size: 14px}',
    '.review-changed {background-color: darkorange; padding: 2px}',
    '.review-not-changed {background-color: transparent; padding: 2px}'
  ]
})
export class ReviewsComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  changed = false;
  selectedReviewId = 0;
  reviews: ReviewInListDto[] = [];
  reviewDataOriginal: ReviewFullDto | null = null;
  reviewDataToChange: ReviewFullDto | null = null;

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private messageDialog: MatDialog,
    private inputTextDialog: MatDialog,
    private deleteConfirmDialog: MatDialog
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadReviewList();
    });
  }

  selectReview(id: number) {
    this.selectedReviewId = id;
    // todo load reviewData
  }

  addReview() {
    const dialogRef = this.inputTextDialog.open(InputTextComponent, {
      width: '500px',
      data: {
        title: 'Neue Aufgabenfolge',
        default: '',
        okButtonLabel: 'Speichern',
        prompt: 'Name der Aufgabenfolge'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (typeof result === 'string') {
        if (result.length > 1) {
          this.backendService.addReview(
            this.workspaceService.selectedWorkspaceId,
            {
              workspaceId: this.workspaceService.selectedWorkspaceId,
              name: result
            }
          ).subscribe(isOK => {
            if (typeof isOK === 'number') {
              this.loadReviewList(isOK);
            } else {
              this.snackBar.open('Konnte neue Aufgabenfolge nicht anlegen.', '', { duration: 3000 });
            }
          });
        }
      }
    });
  }

  deleteReview() {
    const dialogRef = this.deleteConfirmDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Aufgabenfolge löschen',
        content: 'Die aktuell ausgewählte Aufgabenfolge wird gelöscht. Fortsetzen?',
        confirmButtonLabel: 'Löschen',
        showCancel: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.appService.dataLoading = true;
        this.backendService.deleteReviews(
          this.workspaceService.selectedWorkspaceId,
          [this.selectedReviewId]
        ).subscribe(ok => {
          this.selectedReviewId = 0;
          this.appService.dataLoading = false;
          if (ok) {
            this.loadReviewList();
          } else {
            this.snackBar.open(
              'Konnte Aufgabenfolge nicht löschen', 'Fehler', { duration: 3000 }
            );
          }
        });
      }
    });
  }

  playReview() {
    this.changed = !this.changed;
  }

  private loadReviewList(id = 0) {
    this.appService.dataLoading = true;
    this.backendService.getReviewList(this.workspaceService.selectedWorkspaceId)
      .subscribe(reviews => {
        this.reviews = reviews;
        this.reviewDataOriginal = null;
        this.reviewDataToChange = null;
        this.appService.dataLoading = false;
        this.selectReview(id);
      });
  }

  discardChanges() {
    this.messageDialog.open(MessageDialogComponent, {
      width: '400px',
      data: <MessageDialogData>{
        title: 'descard',
        content: 'coming soon',
        type: MessageType.error
      }
    });
  }

  saveChanged() {
    this.messageDialog.open(MessageDialogComponent, {
      width: '400px',
      data: <MessageDialogData>{
        title: 'save',
        content: 'coming soon',
        type: MessageType.error
      }
    });
  }
}
