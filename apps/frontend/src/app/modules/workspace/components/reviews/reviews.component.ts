import {
  Component, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import {
  BookletConfigDto, ReviewConfigDto, ReviewFullDto, ReviewInListDto
} from '@studio-lite-lib/api-dto';
import {
  MatDialog, MatDialogTitle, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {

  MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { CheckForChangesDirective } from '../../directives/check-for-changes.directive';
import { SaveChangesComponent } from '../save-changes/save-changes.component';
import { ReviewConfigComponent } from '../review-config/review-config.component';
import { SelectUnitListComponent } from '../select-unit-list/select-unit-list.component';
import { ReviewMenuComponent } from '../review-menu/review-menu.component';
import { SearchFilterComponent } from '../../../../components/search-filter/search-filter.component';
import { I18nService } from '../../../../services/i18n.service';
import { SaveLock } from '../../../../classes/save-lock.class';

/**
 * The reviews of a workspace: which units each contains, what a reviewer may do in it, and the
 * booklet configuration it is presented with. It warns before leaving with unsaved changes, which is
 * what {@link CheckForChangesDirective} underneath it provides.
 */
@Component({
  selector: 'studio-lite-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],

  imports: [MatDialogTitle, SearchFilterComponent, MatTable, MatSort, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, ReviewMenuComponent, SelectUnitListComponent, ReviewConfigComponent, SaveChangesComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule, DatePipe]
})

export class ReviewsComponent extends CheckForChangesDirective implements OnInit, OnDestroy {
  @ViewChild(MatSort) sort = new MatSort();

  private ngUnsubscribe = new Subject<void>();
  private reviewRequest?: Subscription;
  // The list resets the review data on arrival: a review clicked meanwhile does not unlock
  private isLoadingReviewList = false;
  changed = false;
  selectedReviewId = 0;
  // True while the review list or the selected review are on their way: a change to units or
  // settings made now would be reset by their arrival, so both stay disabled until then, and save too.
  isLoadingReview = false;
  // One save at a time, and what it sent: what is entered meanwhile stays a change (#2094).
  readonly save = new SaveLock();
  // Counts the loads of the selected review's data, so that the answer to a save applies only to the data it
  // was sent from: switched away and back meanwhile, the review was loaded anew, perhaps before the save; a
  // discard counts too.
  private reviewLoads = 0;
  // Counts the loads of the list: a list loaded after a rename and one loaded for another reason may answer in
  // either order, and only the one begun last has every review created or deleted meanwhile.
  private listLoads = 0;
  reviews: ReviewInListDto[] = [];
  reviewDataOriginal: ReviewFullDto = { id: 0 };
  reviewDataToChange: ReviewFullDto = { id: 0 };

  objectsDatasource = new MatTableDataSource<ReviewInListDto>();
  displayedColumns = ['name', 'createdAt', 'changedAt'];

  constructor(
    public workspaceService: WorkspaceService,
    public i18nService: I18nService,
    public appService: AppService,
    private backendService: WorkspaceBackendService,
    private snackBar: MatSnackBar,
    protected translateService: TranslateService,
    protected confirmDiscardChangesDialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    setTimeout(() => this.loadReviewList());
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  selectReview(id: number) {
    this.checkForChangesAndContinue(this.changed).then(go => {
      if (go) {
        this.reviewLoads += 1;
        this.changed = false;
        this.selectedReviewId = id;
        // A late answer for the review selected before would overwrite this one.
        this.reviewRequest?.unsubscribe();
        if (this.selectedReviewId > 0) {
          this.isLoadingReview = true;
          // The review menu reads link, units and settings from here: until the answer they would be
          // those of the review selected before, so the menu's buttons go without them meanwhile.
          this.reviewDataOriginal = { id: 0 };
          this.reviewRequest = this.backendService.getReview(
            this.workspaceService.selectedWorkspaceId, this.selectedReviewId
          )
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(data => {
              // Without an answer nothing stays selected: an empty form saved onto this review, or
              // the data of the one before, would overwrite it.
              if (!data) this.selectedReviewId = 0;
              this.reviewDataOriginal = data || { id: 0 };
              this.reviewDataToChange = data ? ReviewsComponent.copyFrom(data) : { id: 0 };
              this.changed = false;
              this.isLoadingReview = this.isLoadingReviewList;
            });
        } else {
          this.reviewDataToChange = { id: 0 };
          this.reviewDataOriginal = { id: 0 };
          this.changed = false;
          this.isLoadingReview = this.isLoadingReviewList;
        }
      }
    });
  }

  loadReviewList(id = 0): void {
    this.appService.dataLoading = true;
    this.reviewRequest?.unsubscribe();
    this.isLoadingReviewList = true;
    this.isLoadingReview = true;
    this.listLoads += 1;
    const load = this.listLoads;
    this.backendService.getReviewList(this.workspaceService.selectedWorkspaceId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(reviews => {
        if (this.listLoads === load) this.reviews = reviews;
        this.reviewDataOriginal = { id: 0 };
        this.reviewDataToChange = { id: 0 };
        this.appService.dataLoading = false;
        this.isLoadingReviewList = false;
        // Until selectReview locks again for the review to select, nothing runs in between
        this.isLoadingReview = false;
        this.selectReview(id);
        // be sure that mat sort is initialized
        setTimeout(() => this.setObjectsDatasource(this.reviews));
      });
  }

  /**
   * The list alone, for the new name and the time of the change: reloading the whole review would
   * replace what was entered while the save was under way (#2094).
   */
  private reloadReviewNames(): void {
    this.listLoads += 1;
    const load = this.listLoads;
    this.backendService.getReviewList(this.workspaceService.selectedWorkspaceId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(reviews => {
        if (this.listLoads !== load) return;
        this.reviews = reviews;
        this.setObjectsDatasource(this.reviews);
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
    // Back to the data loaded before a save that may be under way: its answer then loads what is stored,
    // as after switching away and back, instead of taking this data for a change to save over it (#2094).
    this.reviewLoads += 1;
    this.changed = false;
    this.reviewDataToChange = this.reviewDataOriginal ? ReviewsComponent.copyFrom(this.reviewDataOriginal) : { id: 0 };
  }

  saveChanges() {
    // The data still belongs to the review selected before, or is about to be replaced.
    if (this.isLoadingReview) return;
    if (this.reviewDataToChange) {
      const reviewId = this.selectedReviewId;
      const load = this.reviewLoads;
      // a copy: what is sent must not change with the edits made while it is under way
      const sent = structuredClone(this.reviewDataToChange);
      const renamed = this.reviewDataOriginal.name !== sent.name;
      if (!this.save.start(sent)) return;
      this.backendService.setReview(
        this.workspaceService.selectedWorkspaceId,
        reviewId,
        sent
      ).pipe(takeUntil(this.ngUnsubscribe)).subscribe(ok => {
        this.save.finish();
        if (ok) {
          // sent as it is, not in the shape of copyFrom, which fills in configs the review lacks and would
          // make it differ from the data edited
          if (this.reviewLoads === load) {
            this.reviewDataOriginal = sent;
            this.changed = this.detectChanges();
          } else if (this.selectedReviewId === reviewId && !this.changed) {
            // loaded anew meanwhile, perhaps before the save had arrived: once more, to show what is stored
            this.selectReview(reviewId);
          }
          if (renamed) this.reloadReviewNames();
          this.snackBar.open(
            this.translateService.instant('workspace.review-saved'),
            '',
            { duration: 1000 });
        } else {
          this.snackBar.open(
            this.translateService.instant('workspace.review-not-saved'),
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
