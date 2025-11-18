import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  switchMap, Subject, takeUntil, of, Observable, tap, BehaviorSubject
} from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackendService } from '../../services/backend.service';
import { ActiveComment } from '../../models/active-comment.interface';
import { DeleteDialogComponent } from '../../../shared/components/delete-dialog/delete-dialog.component';
import { Comment } from '../../models/comment.interface';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { ScrollCommentIntoViewDirective } from '../../directives/scroll-comment-into-view.directive';
import { CommentComponent } from '../comment/comment.component';
import { FilteredCommentsPipe } from '../../pipes/filtered-comments.pipe';
import { FilteredRootCommentsPipe } from '../../pipes/filtered-root-comments.pipe';
import { RootCommentWithReplies } from '../../models/root-comment-with-replies.interface';
import { CommentFilterComponent } from '../comment-item-filter/comment-filter.component';

@Component({
  selector: 'studio-lite-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatProgressSpinner, CommentComponent, ScrollCommentIntoViewDirective, CommentEditorComponent, TranslateModule, FilteredCommentsPipe, FormsModule, FilteredRootCommentsPipe, CommentFilterComponent]
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input() userId!: number;
  @Input() userName!: string;
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() unitItems!: UnitItemDto[];
  @Input() reviewId = 0;
  @Input() newCommentOnly = false;
  @Input() adminMode = false;
  @Output() onCommentsUpdated = new EventEmitter<void>();

  showHiddenComments: BehaviorSubject<boolean> = new BehaviorSubject(false);

  comments: Comment[] = [];
  rootCommentsWithReplies: RootCommentWithReplies[] = [];
  activeComment: ActiveComment | null = null;
  latestCommentId: Subject<number> = new Subject();
  isCommentProcessing: boolean = false;
  filteredItems: string[] = [];

  private latestComment!: Comment;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private backendService: BackendService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.latestCommentId.subscribe(() => this.onCommentsUpdated.emit());
  }

  ngOnInit(): void {
    this.getUpdatedComments()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        setTimeout(() => {
          this.setLatestCommentId();
        });
      });
  }

  updateCommentVisibility(commentId: number, hidden: boolean): void {
    const updateComment = { hidden: hidden, userId: this.userId };
    this.backendService
      .updateCommentVisibility(commentId, updateComment, this.workspaceId, this.unitId, this.reviewId)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(result => {
          if (!result) {
            this.snackBar.open(
              this.translateService.instant('comment.visibility-not-updated'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
          }
          this.snackBar.open(
            this.translateService.instant('comment.visibility-updated'),
            '',
            { duration: 1000 }
          );
        }),
        switchMap(() => this.getUpdatedComments())
      )
      .subscribe(() => {});
  }

  updateComment({ text, commentId, items }: { text: string; commentId: number; items: string[] }): void {
    this.isCommentProcessing = true;
    if (!this.newCommentOnly) {
      const updateComment = { body: text, userId: this.userId };

      this.backendService
        .updateComment(commentId, updateComment, this.workspaceId, this.unitId, this.reviewId)
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(result => {
            if (!result) {
              this.snackBar.open(
                this.translateService.instant('comment.not-updated'),
                this.translateService.instant('error'),
                { duration: 3000 }
              );
              return of(null);
            }
            this.snackBar.open(
              this.translateService.instant('comment.updated'),
              '',
              { duration: 1000 }
            );
            return this.backendService
              .updateCommentItemConnections(
                { userId: this.userId, unitItemUuids: items },
                this.workspaceId,
                this.unitId,
                this.reviewId,
                commentId
              );
          }),
          tap(() => this.setActiveComment(null)),
          switchMap(() => this.getUpdatedComments())
        )
        .subscribe(() => {
          this.setLatestCommentId();
          this.isCommentProcessing = false;
        });
    }
  }

  deleteComment({ commentId, numberOfReplies }: { commentId: number; numberOfReplies: number; }): void {
    this.openDeleteDialog(commentId, numberOfReplies > 0);
  }

  private openDeleteDialog(commentId: number, withReplies: boolean): void {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant(
            withReplies ? 'comments.comments-delete-title' : 'comments.comment-delete-title'
          ),
          content: this.translateService.instant(
            withReplies ? 'comments.comments-delete-question' : 'comments.comment-delete-question')
        }
      })
      .afterClosed()
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(result => {
          if (result) {
            this.isCommentProcessing = true;
            return this.backendService
              .deleteComment(commentId, this.workspaceId, this.unitId, this.reviewId);
          }
          return of(null);
        }),
        switchMap(() => this.getUpdatedComments())
      ).subscribe(() => {
        this.setLatestCommentId();
        this.isCommentProcessing = false;
      });
  }

  setActiveComment(activeComment: ActiveComment | null): void {
    this.activeComment = activeComment;
  }

  private setLatestCommentId(): void {
    if (this.latestComment) {
      this.latestCommentId.next(this.latestComment.id);
    }
  }

  addComment({ text, parentId, items }: { text: string; parentId: number | null; items: string[]; }): void {
    this.isCommentProcessing = true;
    const comment = {
      body: text,
      userName: this.userName,
      userId: this.userId,
      parentId: parentId,
      unitId: this.unitId
    };

    this.backendService
      .createComment(comment, this.workspaceId, this.unitId, this.reviewId)
      .pipe(
        takeUntil(this.ngUnsubscribe),
        switchMap(commentId => {
          if (!commentId) {
            this.snackBar.open(
              this.translateService.instant('comment.not-sent'),
              this.translateService.instant('error'),
              { duration: 3000 }
            );
            return of(null);
          }
          this.snackBar.open(
            this.translateService.instant('comment.sent'),
            '',
            { duration: 1000 });
          return this.backendService
            .updateCommentItemConnections(
              { userId: this.userId, unitItemUuids: items },
              this.workspaceId,
              this.unitId,
              this.reviewId,
              commentId
            );
        }),
        tap(() => {
          this.setActiveComment(null);
          if (this.newCommentOnly) {
            this.onCommentsUpdated.emit();
          }
        }),
        switchMap(() => this.getUpdatedComments())
      )
      .subscribe(() => {
        this.setLatestCommentId();
        this.isCommentProcessing = false;
      });
  }

  private setComments(comments: Comment[]): void {
    this.comments = comments;
    this.setRootCommentsWithReplies();
  }

  private setRootCommentsWithReplies(): void {
    this.rootCommentsWithReplies = this.comments
      .filter(c => c.parentId === null)
      .map(comment => (
        {
          rootComment: comment,
          replies: this.comments.filter(reply => reply.parentId === comment.id)
        }));
  }

  private getUpdatedComments(): Observable<boolean> {
    if (this.newCommentOnly) return of(true);
    return this.backendService.getComments(this.workspaceId, this.unitId, this.reviewId)
      .pipe(
        switchMap(comments => {
          this.setComments(comments);
          if (this.comments.length) {
            this.latestComment = this.comments
              .reduce((previousComment, currentComment) => (
                previousComment.changedAt > currentComment.changedAt ? previousComment : currentComment));
            if (this.reviewId <= 0) {
              const updateUnitUser = {
                lastSeenCommentChangedAt: this.latestComment.changedAt,
                userId: this.userId
              };
              return this.backendService.updateComments(updateUnitUser, this.workspaceId, this.unitId);
            }
            return of(true);
          }
          return of(false);
        })
      );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleVisibility(comment : Comment): void {
    this.updateCommentVisibility(comment.id, !comment.hidden);
  }
}
