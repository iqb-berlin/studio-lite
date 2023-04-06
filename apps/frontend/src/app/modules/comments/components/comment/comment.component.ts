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
  @Input() adminMode = false;

  @Output() setActiveComment = new EventEmitter<ActiveComment | null>();
  @Output() deleteComment = new EventEmitter<{ commentId: number; numberOfReplies: number }>();
  @Output() addComment = new EventEmitter<{ text: string; parentId: number | null }>();
  @Output() updateComment = new EventEmitter<{ text: string; commentId: number }>();

  ownComment: boolean = false;
  activeCommentType = ActiveCommentType;
  replyId: number | null = null;

  ngOnInit(): void {
    this.ownComment = this.userId > 0 && this.userId === this.comment.userId;
    this.replyId = this.parentId ? this.parentId : this.comment.id;
  }
}
