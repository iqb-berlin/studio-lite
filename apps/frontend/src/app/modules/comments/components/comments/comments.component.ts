import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  switchMap, Subject, takeUntil, of, Observable, tap
} from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { BackendService } from '../../services/backend.service';
import { ActiveComment } from '../../models/active-comment.interface';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { Comment } from '../../models/comment.interface';
import { RepliesPipe } from '../../pipes/replies.pipe';
import { RootCommentsPipe } from '../../pipes/root-comments.pipe';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { ScrollCommentIntoViewDirective } from '../../directives/scroll-comment-into-view.directive';
import { CommentComponent } from '../comment/comment.component';
import { CommentItemSelectionComponent } from '../comment-item-selection/comment-item-selection.component';
import { FilteredCommentsPipe } from '../../pipes/filtered-comments.pipe';

@Component({
  selector: 'studio-lite-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  // eslint-disable-next-line max-len
  imports: [MatProgressSpinner, CommentComponent, ScrollCommentIntoViewDirective, CommentEditorComponent, TranslateModule, RootCommentsPipe, RepliesPipe, CommentItemSelectionComponent, FilteredCommentsPipe, MatMenuTrigger, MatMenu, MatFabButton, MatIcon]
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

  comments: Comment[] = [];
  activeComment: ActiveComment | null = null;
  latestCommentId: Subject<number> = new Subject();
  isCommentProcessing: boolean = false;
  filteredItems: string[] = [];

  private latestComment!: Comment;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private backendService: BackendService,
    public dialog: MatDialog
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

  updateComment({ text, commentId, items }: { text: string; commentId: number; items: string[] }): void {
    this.isCommentProcessing = true;
    if (!this.newCommentOnly) {
      const updateComment = { body: text, userId: this.userId };

      this.backendService
        .updateComment(commentId, updateComment, this.workspaceId, this.unitId, this.reviewId)
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(() => this.backendService
            .updateCommentItemConnections(
              { userId: this.userId, unitItemUuids: items },
              this.workspaceId,
              this.unitId,
              this.reviewId,
              commentId
            )
          ),
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
          if (!commentId) return of(null);

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

  private getUpdatedComments(): Observable<boolean> {
    if (this.newCommentOnly) return of(true);
    return this.backendService.getComments(this.workspaceId, this.unitId, this.reviewId)
      .pipe(
        switchMap(comments => {
          this.comments = comments;
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
}
