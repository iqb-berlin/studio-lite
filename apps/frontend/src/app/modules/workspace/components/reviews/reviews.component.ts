import {
  Component, OnInit, ViewChild
} from '@angular/core';
import {
  BookletConfigDto, ReviewConfigDto, ReviewFullDto, ReviewInListDto
} from '@studio-lite-lib/api-dto';
import {
  MatDialog, MatDialogTitle, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  // eslint-disable-next-line max-len
  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatButton } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { BackendService } from '../../services/backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { CheckForChangesDirective } from '../../directives/check-for-changes.directive';
import { SaveChangesComponent } from '../save-changes/save-changes.component';
import { ReviewConfigComponent } from '../review-config/review-config.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ReviewMenuComponent } from '../review-menu/review-menu.component';
import { SearchFilterComponent } from '../../../shared/components/search-filter/search-filter.component';

@Component({
  selector: 'studio-lite-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  standalone: true,
  // eslint-disable-next-line max-len
  imports: [MatDialogTitle, NgIf, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, ReviewMenuComponent, SelectUnitListComponent, ReviewConfigComponent, SaveChangesComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule]
})

export class ReviewsComponent extends CheckForChangesDirective implements OnInit {
  @ViewChild(MatSort) sort = new MatSort();

  changed = false;
  selectedReviewId = 0;
  reviews: ReviewInListDto[] = [];
  reviewDataOriginal: ReviewFullDto = { id: 0 };
  reviewDataToChange: ReviewFullDto = { id: 0 };

  objectsDatasource = new MatTableDataSource<ReviewInListDto>();
  displayedColumns = ['name'];

  constructor(
    public workspaceService: WorkspaceService,
    public appService: AppService,
    private backendService: BackendService,
    private snackBar: MatSnackBar,
    protected translateService: TranslateService,
    protected confirmDiscardChangesDialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => this.loadReviewList());
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
        // be sure that mat sort is initialized
        setTimeout(() => this.setObjectsDatasource(this.reviews));
      });
  }

  private setObjectsDatasource(reviews: ReviewInListDto[]): void {
    this.objectsDatasource = new MatTableDataSource(reviews);
    this.objectsDatasource
      .filterPredicate = (reviewList: ReviewInListDto, filter) => ['name']
        .some(column => (reviewList[column as keyof ReviewInListDto] as string || '')
          .toLowerCase()
          .includes(filter));
    this.objectsDatasource.sort = this.sort;
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
            this.translateService.instant('workspace.review-saved'),
            '',
            { duration: 1000 });
        } else {
          this.snackBar.open(
            this.translateService.instant('workspace.review-saved'),
            this.translateService.instant('workspace.error'),
            { duration: 3000 }
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
