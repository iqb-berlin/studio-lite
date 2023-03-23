import { Component, OnInit } from '@angular/core';
import {
  BookletConfigDto, ReviewConfigDto, ReviewFullDto, ReviewInListDto
} from '@studio-lite-lib/api-dto';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../../backend.service';
import { WorkspaceService } from '../../workspace.service';
import { AppService } from '../../../app.service';
import { CheckForChangesDirective } from '../../directives/check-for-changes.directive';

@Component({
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})

export class ReviewsComponent extends CheckForChangesDirective implements OnInit {
  changed = false;
  selectedReviewId = 0;
  reviews: ReviewInListDto[] = [];
  reviewDataOriginal: ReviewFullDto = { id: 0 };
  reviewDataToChange: ReviewFullDto = { id: 0 };

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    protected confirmDiscardChangesDialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.loadReviewList();
    });
  }

  selectReview(id: number) {
    this.checkForChangesAndContinue(this.changed).then(go => {
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
                this.changed = false;
              }
            });
        } else {
          this.reviewDataToChange = { id: 0 };
          this.reviewDataOriginal = { id: 0 };
          this.changed = false;
        }
      }
    });
  }

  loadReviewList(id = 0): void {
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

  unitSelectionChanged(selectedUnitIds: number[]): void {
    if (this.reviewDataToChange) {
      this.reviewDataToChange.units = selectedUnitIds;
      this.changed = this.detectChanges();
    }
  }

  discardChanges() {
    this.changed = false;
    this.reviewDataToChange = this.reviewDataOriginal ? ReviewsComponent.copyFrom(this.reviewDataOriginal) : { id: 0 };
  }

  saveChanges() {
    if (this.reviewDataToChange) {
      this.backendService.setReview(
        this.workspaceService.selectedWorkspaceId,
        this.selectedReviewId,
        this.reviewDataToChange
      ).subscribe(ok => {
        if (ok) {
          if (this.reviewDataOriginal.name === this.reviewDataToChange.name) {
            this.reviewDataOriginal = ReviewsComponent.copyFrom(this.reviewDataToChange);
          } else {
            this.loadReviewList(this.selectedReviewId);
          }
          this.changed = false;
          this.snackBar.open(
            'Aufgabenfolge gespeichert', '', { duration: 1000 }
          );
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

  reviewConfigSettingsChange(reviewConfigSettings: ReviewConfigDto): void {
    if (this.reviewDataToChange.settings) {
      this.reviewDataToChange.settings.reviewConfig = reviewConfigSettings;
    } else {
      this.reviewDataToChange.settings = {
        reviewConfig: reviewConfigSettings
      };
    }
  }

  bookletConfigSettingsChange(bookletConfigSettings: BookletConfigDto): void {
    if (this.reviewDataToChange.settings) {
      this.reviewDataToChange.settings.bookletConfig = bookletConfigSettings;
    } else {
      this.reviewDataToChange.settings = {
        bookletConfig: bookletConfigSettings
      };
    }
  }
}
