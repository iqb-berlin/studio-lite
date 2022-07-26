import {
  Component, EventEmitter, Input, OnChanges, Output, SimpleChanges
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  switchMap, Subject, takeUntil, of, Observable
} from 'rxjs';
import { BackendService } from '../../services/backend.service';
import { ActiveComment } from '../../types/active.comment';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { Comment } from '../../types/comment';

@Component({
  selector: 'studio-lite-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnChanges {
  @Input() userId!: number;
  @Input() userName!: string;
  @Input() unitId!: number;
  @Input() workspaceId!: number;
  @Output() onCommentsUpdated = new EventEmitter<void>()

  comments: Comment[] = [];
  activeComment: ActiveComment | null = null;
  latestCommentId: Subject<number> = new Subject();

  private latestComment!: Comment;
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private backendService: BackendService,
    public dialog: MatDialog
  ) {
    this.latestCommentId.subscribe(() => this.onCommentsUpdated.emit());
  }

  ngOnChanges(changes: SimpleChanges): void {
    const unitId = 'unitId';
    const workspaceId = 'workspaceId';
    if ((changes[unitId] && changes[unitId].currentValue) ||
    (changes[workspaceId] && changes[workspaceId].currentValue)) {
      this.getUpdatedComments()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
          this.setLatestCommentId();
        });
    }
  }

  updateComment({ text, commentId }: { text: string; commentId: number; }): void {
    const updateComment = { body: text, userId: this.userId };
    this.backendService
      .updateComment(commentId, updateComment, this.workspaceId, this.unitId)
      .pipe(switchMap(() => {
        this.setActiveComment(null);
        return this.getUpdatedComments();
      }))
      .subscribe(() => {
        this.setLatestCommentId();
      });
  }

  deleteComment(commentId: number): void {
    this.openDeleteDialog(commentId);
  }

  private openDeleteDialog(commentId: number): void {
    this.dialog
      .open(DeleteDialogComponent, {
        width: '400px',
        data: {
          title: this.translateService.instant('comments.comment-delete-title'),
          content: this.translateService.instant('comments.comment-delete-question')
        }
      })
      .afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result => {
        if (result) {
          this.confirmDelete(commentId);
        }
      });
  }

  private confirmDelete(commentId: number): void {
    this.backendService.deleteComment(commentId, this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe),
        switchMap(() => this.getUpdatedComments()))
      .subscribe(() => {
        this.setLatestCommentId();
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
    const comment = {
      body: text,
      userName: this.userName,
      userId: this.userId,
      parentId: parentId,
      unitId: this.unitId
    };
    this.backendService
      .createComment(comment, this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe),
        switchMap(() => {
          this.setActiveComment(null);
          return this.getUpdatedComments();
        }))
      .subscribe(() => {
        this.setLatestCommentId();
      });
  }

  private getUpdatedComments(): Observable<boolean> {
    return this.backendService.getComments(this.workspaceId, this.unitId)
      .pipe(
        switchMap(comments => {
          this.comments = comments;
          if (this.comments.length) {
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
