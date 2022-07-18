import {
  Component, Input, OnChanges, SimpleChanges
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { BackendService } from '../../services/backend.service';
import { ActiveCommentInterface } from '../../types/active-comment.interface';
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

  comments: Comment[] = [];
  activeComment: ActiveCommentInterface | null = null;
  latestCommentId: Subject<number> = new Subject();

  private ngUnsubscribe = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private commentsService: BackendService,
    public dialog: MatDialog
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const unitId = 'unitId';
    const workspaceId = 'workspaceId';
    if ((changes[unitId] && changes[unitId].currentValue) ||
    (changes[workspaceId] && changes[workspaceId].currentValue)) {
      this.sortComments();
    }
  }

  updateComment({ text, commentId }: { text: string; commentId: number; }): void {
    const updateComment = { body: text, userId: this.userId };
    this.commentsService
      .updateComment(commentId, updateComment, this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.activeComment = null;
        this.sortComments();
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
    this.commentsService.deleteComment(commentId, this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => {
        this.sortComments();
      });
  }

  setActiveComment(activeComment: ActiveCommentInterface | null): void {
    this.activeComment = activeComment;
  }

  addComment({ text, parentId }: { text: string; parentId: number | null; }): void {
    const comment = {
      body: text,
      userName: this.userName,
      userId: this.userId,
      parentId: parentId,
      unitId: this.unitId
    };
    this.commentsService
      .createComment(comment, this.workspaceId, this.unitId)
      .subscribe(() => {
        this.activeComment = null;
        this.sortComments();
      });
  }

  private sortComments(): void {
    this.commentsService.getComments(this.workspaceId, this.unitId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(comments => {
        this.comments = comments.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        if (this.comments.length) {
          const latestComment = this.comments
            .reduce((previousComment, currentComment) => (
              previousComment.changedAt > currentComment.changedAt ? previousComment : currentComment));
          setTimeout(() => {
            this.latestCommentId.next(latestComment.id);
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
