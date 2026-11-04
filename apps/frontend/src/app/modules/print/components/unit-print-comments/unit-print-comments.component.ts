import {
  Component, Input, OnChanges, OnDestroy, SimpleChanges
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { Subject, takeUntil } from 'rxjs';
import { Comment } from '../../../comments/models/comment.interface';
import { BackendService } from '../../../comments/services/backend.service';
import { RootCommentsWithRepliesPipe } from '../../../comments/pipes/root-comments-with-replies.pipe';
import { UnitPrintCommentComponent } from '../unit-print-comment/unit-print-comment.component';

/**
 * The comments of a unit as read-only threads, for the printout and for the info panel of a review:
 * each comment with its replies right below it, as in the discussion (#2109).
 */
@Component({
  selector: 'studio-lite-unit-print-comments',
  templateUrl: './unit-print-comments.component.html',
  styleUrls: ['./unit-print-comments.component.scss'],
  imports: [TranslateModule, RootCommentsWithRepliesPipe, UnitPrintCommentComponent],
  providers: [BackendService]
})
export class UnitPrintCommentsComponent implements OnChanges, OnDestroy {
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() reviewId: number = 0;
  @Input() comments: Comment[] = [];
  @Input() metadata!: ItemsMetadataValues[] | null;

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private backendService: BackendService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { unitId, workspaceId, reviewId } = changes;
    if (unitId || workspaceId || reviewId) {
      this.fetchComments();
    }
  }

  private fetchComments(): void {
    this.backendService
      .getComments(this.workspaceId, this.unitId, this.reviewId)

      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(comments => this.setComments(comments));
  }

  private setComments(comments: Comment[]): void {
    this.comments = comments;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
