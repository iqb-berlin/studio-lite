import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { ActiveCommentInterface, ActiveCommentType } from '../../types/active-comment.interface';
import { Comment } from '../../types/comment';

@Component({
  selector: 'studio-lite-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment!: Comment;
  @Input() activeComment!: ActiveCommentInterface | null;
  @Input() replies!: Comment[];
  @Input() userId!: number;
  @Input() parentId!: number | null;
  @Input() latestCommentId!: Subject<number>;

  @Output() setActiveComment = new EventEmitter<ActiveCommentInterface | null>();
  @Output() deleteComment = new EventEmitter<number>();
  @Output() addComment = new EventEmitter<{ text: string; parentId: number | null }>();
  @Output() updateComment = new EventEmitter<{ text: string; commentId: number }>();

  createdAt: string = '';
  canReply: boolean = false;
  canEdit: boolean = false;
  canDelete: boolean = false;
  activeCommentType = ActiveCommentType;
  replyId: number | null = null;
  timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  ngOnInit(): void {
    this.createdAt = new Date(this.comment.createdAt).toLocaleDateString();
    this.canReply = Boolean(this.userId);
    this.canEdit = this.userId === this.comment.userId;
    this.canDelete = this.userId === this.comment.userId && this.replies.length === 0;
    this.replyId = this.parentId ? this.parentId : this.comment.id;
  }
}
