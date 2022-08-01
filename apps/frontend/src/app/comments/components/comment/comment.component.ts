import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { ActiveComment, ActiveCommentType } from '../../types/active.comment';
import { Comment } from '../../types/comment';

@Component({
  selector: 'studio-lite-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment!: Comment;
  @Input() activeComment!: ActiveComment | null;
  @Input() replies!: Comment[];
  @Input() userId!: number;
  @Input() parentId!: number | null;
  @Input() latestCommentId!: Subject<number>;

  @Output() setActiveComment = new EventEmitter<ActiveComment | null>();
  @Output() deleteComment = new EventEmitter<number>();
  @Output() addComment = new EventEmitter<{ text: string; parentId: number | null }>();
  @Output() updateComment = new EventEmitter<{ text: string; commentId: number }>();

  ownComment: boolean = false;
  canDelete: boolean = false;
  activeCommentType = ActiveCommentType;
  replyId: number | null = null;

  ngOnInit(): void {
    this.ownComment = this.userId === this.comment.userId;
    this.canDelete = this.ownComment && this.replies.length === 0;
    this.replyId = this.parentId ? this.parentId : this.comment.id;
  }
}
