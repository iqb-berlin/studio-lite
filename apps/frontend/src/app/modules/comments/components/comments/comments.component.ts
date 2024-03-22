import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import {
  switchMap, Subject, takeUntil, of, Observable
} from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgIf, NgFor } from '@angular/common';
import { BackendService } from '../../services/backend.service';
import { ActiveComment } from '../../models/active-comment.interface';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { Comment } from '../../models/comment.interface';
import { RepliesPipe } from '../../pipes/replies.pipe';
import { RootCommentsPipe } from '../../pipes/root-comments.pipe';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { ScrollCommentIntoViewDirective } from '../../directives/scroll-comment-into-view.directive';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'studio-lite-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
  standalone: true,
  imports: [NgIf, MatProgressSpinner, NgFor, CommentComponent, ScrollCommentIntoViewDirective, CommentEditorComponent, TranslateModule, RootCommentsPipe, RepliesPipe]
})
export class CommentsComponent implements OnInit {
  @Input() userId!: number;
  @Input() userName!: string;
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Input() reviewId = 0;
  @Input() newCommentOnly = false;
  @Input() adminMode = false;
  @Output() onCommentsUpdated = new EventEmitter<void>();

  comments: Comment[] = [];
  activeComment: ActiveComment | null = null;
  latestCommentId: Subject<number> = new Subject();
  isCommentProcessing: boolean = false;

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
        this.setLatestCommentId();
      });
  }

  updateComment({ text, commentId }: { text: string; commentId: number; }): void {
    this.isCommentProcessing = true;
    if (!this.newCommentOnly) {
      const updateComment = { body: text, userId: this.userId };
      this.backendService
        .updateComment(commentId, updateComment, this.workspaceId, this.unitId, this.reviewId)
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap(() => {
            this.setActiveComment(null);
            return this.getUpdatedComments();
          })
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
            return this.backendService.deleteComment(commentId, this.workspaceId, this.unitId, this.reviewId);
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

  addComment({ text, parentId }: { text: string; parentId: number | null; }): void {
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
        switchMap(() => {
          this.setActiveComment(null);
          if (this.newCommentOnly) this.onCommentsUpdated.emit();
          return this.getUpdatedComments();
        })
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
          if (this.comments.length && this.reviewId <= 0) {
            this.latestComment = this.comments
              .reduce((previousComment, currentComment) => (
                previousComment.changedAt > currentComment.changedAt ? previousComment : currentComment));
            const updateUnitUser = { lastSeenCommentChangedAt: this.latestComment.changedAt, userId: this.userId };
            return this.backendService.updateComments(updateUnitUser, this.workspaceId, this.unitId);
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
