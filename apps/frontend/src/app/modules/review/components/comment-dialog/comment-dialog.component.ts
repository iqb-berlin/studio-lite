import {
  MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
} from '@angular/material/dialog';
import {
  afterNextRender, Component, ElementRef, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { Subject, takeUntil } from 'rxjs';
import { CommentsComponent } from '../../../comments/components/comments/comments.component';
import { AppService } from '../../../../services/app.service';
import { ReviewService } from '../../services/review.service';
import { ReviewBackendService } from '../../services/review-backend.service';
import { SortAscendingPipe } from '../../../comments/pipes/sort-ascending.pipe';

const NAME_LOCAL_STORAGE_KEY = 'iqb-studio-user-name-for-review-comments';

@Component({
  selector: 'studio-lite-comment-dialog',
  templateUrl: './comment-dialog.component.html',
  styleUrls: ['./comment-dialog.component.scss'],

  imports: [MatDialogTitle, MatFormField, MatLabel, MatInput, FormsModule, MatDialogContent, CommentsComponent, MatDialogActions, MatButton, MatDialogClose, TranslateModule, CdkDrag, CdkDragHandle]
})
export class CommentDialogComponent implements OnInit, OnDestroy {
  userName = '';
  /**
   * Whether the editor takes the focus when it appears: only when the name was there as the dialog
   * opened -- logged in, or given before and kept -- and has not been edited since. While a name is
   * being typed, the editor appears with its first letter (and again after the name was cleared);
   * taking the focus there sent the rest of the name into the comment (#1785).
   */
  focusEditor = false;
  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;
  unitItems: UnitItemDto[] = [];
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private backendService: ReviewBackendService,
    public reviewService: ReviewService,
    public appService: AppService,
    public dialogRef: MatDialogRef<CommentDialogComponent>
  ) {
    // After the first rendering, not in ngAfterViewInit: focusing the field changes the state of its
    // form field, which may not change while the view is being checked
    afterNextRender(() => this.focusNameIfMissing());
  }

  ngOnInit() {
    if (this.appService.authData.userId === 0) {
      this.userName = localStorage.getItem(NAME_LOCAL_STORAGE_KEY) || '';
    } else {
      this.userName = this.appService.authData.userLongName || this.appService.authData.userName;
    }
    this.focusEditor = !!this.userName;
    this.backendService
      .getUnitItems(this.reviewService.reviewId, this.reviewService.unitDbId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(items => this.setUnitItems(items));
  }

  /** Without a name, the name field comes first. With one, the editor has taken the focus itself. */
  focusNameIfMissing(): void {
    if (!this.focusEditor) this.nameInput?.nativeElement.focus();
  }

  private setUnitItems(items: UnitItemDto[]) {
    this.unitItems = items
      .sort((a, b) => SortAscendingPipe
        .sortAscending(a, b, 'id'));
  }

  close() {
    if (!this.reviewService.reviewConfig.showOthersComments) this.dialogRef.close();
  }

  storeUserName() {
    this.focusEditor = false;
    localStorage.setItem(NAME_LOCAL_STORAGE_KEY, this.userName);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
