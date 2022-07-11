import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { CommentsService } from '../../services/comments.service';
import { ActiveCommentInterface } from '../../types/active-comment.interface';
import { Comment } from '../../types/comment';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';

@Component({
  selector: 'studio-lite-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  @Input() currentUserId!: number;
  @Input() currentUserName!: string;

  comments: Comment[] = [];
  activeComment: ActiveCommentInterface | null = null;

  constructor(
    private translateService: TranslateService,
    private commentsService: CommentsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.updateComments();
  }

  updateComment({ text, commentId }: { text: string; commentId: number; }): void {
    this.commentsService
      .updateComment(commentId, text)
      .subscribe(() => {
        this.comments = this.comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, body: text };
          }
          return comment;
        });
        this.activeComment = null;
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
      .afterClosed().subscribe(result => {
        if (result) {
          this.confirmDelete(commentId);
        }
      });
  }

  private confirmDelete(commentId: number): void {
    this.commentsService.deleteComment(commentId)
      .subscribe(() => {
        this.comments = this.comments.filter(
          comment => comment.id !== commentId
        );
      });
  }

  setActiveComment(activeComment: ActiveCommentInterface | null): void {
    this.activeComment = activeComment;
  }

  addComment({ text, parentId }: { text: string; parentId: number | null; }): void {
    const comment: Partial<Comment> = {
      body: text,
      userName: this.currentUserName,
      userId: this.currentUserId,
      parentId: parentId
    };
    this.commentsService
      .createComment(comment)
      .subscribe(() => {
        this.activeComment = null;
        this.updateComments();
      });
  }

  private updateComments() {
    this.commentsService.getComments().subscribe(comments => {
      this.comments = comments;
    });
  }
}
