import { Component, OnInit, ViewChild } from '@angular/core';
import { ReviewFullDto, ReviewInListDto } from '@studio-lite-lib/api-dto';
import { ConfirmDialogComponent, ConfirmDialogData } from '@studio-lite-lib/iqb-components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { BookletConfigEditComponent } from '@studio-lite/studio-components';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { WorkspaceService } from '../workspace.service';
import { SelectUnitListComponent } from '../components/select-unit-list.component';
import { AppService } from '../../app.service';
import { InputTextComponent } from '../../components/input-text.component';
import { ReviewConfigEditComponent } from '../components/review-config-edit.component';

@Component({
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})

export class ReviewsComponent implements OnInit {
  @ViewChild('unitSelectionTable') unitSelectionTable: SelectUnitListComponent | undefined;
  @ViewChild('bookletConfig') bookletConfigElement: BookletConfigEditComponent | undefined;
  @ViewChild('reviewConfig') reviewConfigElement: ReviewConfigEditComponent | undefined;
  changed = false;
  selectedReviewId = 0;
  reviews: ReviewInListDto[] = [];
  reviewDataOriginal: ReviewFullDto = { id: 0 };
  reviewDataToChange: ReviewFullDto = { id: 0 };
  // eslint-disable-next-line no-restricted-globals
  locationOrigin = location.origin;
  get passwordLength(): number {
    if (this.selectedReviewId === 0) return -1;
    if (!this.reviewDataOriginal.password) return 0;
    return this.reviewDataOriginal.password.length;
  }

  get passwordNewLength(): number {
    if (this.selectedReviewId === 0) return -1;
    if (!this.reviewDataToChange.password) return 0;
    return this.reviewDataToChange.password.length;
  }

  get unitCount(): number {
    if (this.selectedReviewId === 0) return -1;
    if (!this.reviewDataOriginal.units) return 0;
    return this.reviewDataOriginal.units.length;
  }

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    private messageDialog: MatDialog,
    private confirmDiscardDialog: MatDialog,
    private inputTextDialog: MatDialog,
    private confirmDiscardChangesDialog: MatDialog,
    private clipboard: Clipboard,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.loadReviewList();
    });
  }

  selectReview(id: number) {
    this.checkForChangesAndContinue().then(go => {
      if (go) {
        this.changed = false;
        this.selectedReviewId = id;
        if (this.selectedReviewId > 0) {
          this.backendService.getReview(
            this.workspaceService.selectedWorkspaceId, this.selectedReviewId
          )
            .subscribe(data => {
              if (data) {
                this.reviewDataOriginal = data;
                this.reviewDataToChange = ReviewsComponent.copyFrom(data);
                // if (this.bookletConfigElement) this.bookletConfigElement.config = this.reviewDataToChange.settings;
                this.changed = false;
                if (this.unitSelectionTable) this.unitSelectionTable.selectedUnitIds = data.units ? data.units : [];
              }
            });
        } else {
          this.reviewDataToChange = { id: 0 };
          this.reviewDataOriginal = { id: 0 };
          this.changed = false;
          if (this.unitSelectionTable) this.unitSelectionTable.selectedUnitIds = [];
        }
      }
    });
  }

  addReview() {
    this.checkForChangesAndContinue().then(go => {
      if (go) {
        this.changed = false;
        const dialogRef = this.inputTextDialog.open(InputTextComponent, {
          width: '500px',
          data: {
            title: 'Neue Aufgabenfolge',
            default: '',
            okButtonLabel: 'Speichern',
            prompt: 'Name der Aufgabenfolge'
          }
        });

        dialogRef.afterClosed()
          .subscribe(result => {
            if (typeof result === 'string') {
              if (result.length > 1) {
                this.backendService.addReview(
                  this.workspaceService.selectedWorkspaceId,
                  {
                    workspaceId: this.workspaceService.selectedWorkspaceId,
                    name: result
                  }
                )
                  .subscribe(isOK => {
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
    });
  }

  deleteReview() {
    const dialogRef = this.confirmDiscardChangesDialog.open(ConfirmDialogComponent, {
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
        this.changed = false;
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

  private async checkForChangesAndContinue(): Promise<boolean> {
    if (!this.changed) return true;
    const dialogResult = await lastValueFrom(this.confirmDiscardChangesDialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: <ConfirmDialogData>{
        title: 'Verwerfen der Änderungen',
        content: 'Die Änderungen an der Aufgabenfolge werden verworfen. Fortsetzen?',
        confirmButtonLabel: 'Verwerfen',
        showCancel: true
      }
    }).afterClosed());
    return dialogResult !== false;
  }

  private loadReviewList(id = 0) {
    this.appService.dataLoading = true;
    this.backendService.getReviewList(this.workspaceService.selectedWorkspaceId)
      .subscribe(reviews => {
        this.reviews = reviews;
        this.reviewDataOriginal = { id: 0 };
        this.reviewDataToChange = { id: 0 };
        this.appService.dataLoading = false;
        this.selectReview(id);
      });
  }

  unitSelectionChanged(): void {
    if (this.reviewDataToChange && this.unitSelectionTable) {
      this.reviewDataToChange.units = this.unitSelectionTable.selectedUnitIds;
      this.changed = this.detectChanges();
    }
  }

  discardChanges() {
    this.changed = false;
    this.reviewDataToChange = this.reviewDataOriginal ? ReviewsComponent.copyFrom(this.reviewDataOriginal) : { id: 0 };
    if (this.reviewDataToChange && this.unitSelectionTable) {
      this.unitSelectionTable.selectedUnitIds = this.reviewDataToChange.units ? this.reviewDataToChange.units : [];
    }
  }

  saveChanged() {
    if (this.reviewDataToChange) {
      this.backendService.setReview(
        this.workspaceService.selectedWorkspaceId,
        this.selectedReviewId,
        this.reviewDataToChange
      ).subscribe(ok => {
        if (ok) {
          this.snackBar.open(
            'Aufgabenfolge gespeichert', '', { duration: 1000 }
          );
          if (this.reviewDataOriginal.name === this.reviewDataToChange.name) {
            this.reviewDataOriginal = ReviewsComponent.copyFrom(this.reviewDataToChange);
            this.changed = false;
          } else {
            this.loadReviewList(this.selectedReviewId);
          }
        } else {
          this.snackBar.open(
            'Konnte Aufgabenfolge nicht speichern', 'Fehler', { duration: 3000 }
          );
        }
      });
    }
  }

  detectChanges(): boolean {
    if (this.reviewDataToChange && this.reviewDataOriginal) {
      if (this.reviewDataOriginal.name !== this.reviewDataToChange.name) return true;
      if (this.reviewDataOriginal.password !== this.reviewDataToChange.password) return true;
      if (this.reviewDataOriginal.units && this.reviewDataToChange.units) {
        if (this.reviewDataOriginal.units.join() !== this.reviewDataToChange.units.join()) return true;
      }
      if (
        JSON.stringify(this.reviewDataOriginal.settings) === JSON.stringify(this.reviewDataToChange.settings)
      ) {
        return false;
      }
    }
    return true;
  }

  private static copyFrom(originalData: ReviewFullDto): ReviewFullDto {
    return {
      id: originalData.id,
      name: originalData.name,
      password: originalData.password,
      link: originalData.link,
      settings: originalData.settings ? {
        bookletConfig: { ...originalData.settings.bookletConfig },
        reviewConfig: { ...originalData.settings.reviewConfig }
      } : originalData.settings,
      units: originalData.units ? originalData.units.map(u => u) : []
    };
  }

  copyLinkToClipboard() {
    this.clipboard.copy(`${this.locationOrigin}/#/${this.reviewDataToChange.link}`);
    this.snackBar.open(
      'Link in die Zwischenablage kopiert.', '', { duration: 1000 }
    );
  }

  configChanged() {
    if (this.bookletConfigElement && this.reviewConfigElement) {
      if (this.reviewDataToChange.settings) {
        this.reviewDataToChange.settings.bookletConfig = this.bookletConfigElement.config;
        this.reviewDataToChange.settings.reviewConfig = this.reviewConfigElement.config;
      } else {
        this.reviewDataToChange.settings = {
          reviewConfig: this.reviewConfigElement.config,
          bookletConfig: this.bookletConfigElement.config
        };
      }
      this.changed = this.detectChanges();
    }
  }

  printReview(): void {
    if (this.reviewDataOriginal.workspaceId && this.reviewDataOriginal.units) {
      const url = this.router
        .serializeUrl(this.router
          .createUrlTree(['/print'], {
            queryParams: {
              unitIds: this.reviewDataOriginal.units,
              workspaceId: this.reviewDataOriginal.workspaceId
            }
          }));
      window.open(`#${url}`, '_blank');
    }
  }
}
