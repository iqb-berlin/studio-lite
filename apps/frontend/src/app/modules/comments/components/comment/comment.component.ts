import {
  Component, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';

import { ActiveComment, ActiveCommentType } from '../../models/active-comment.interface';
import { Comment } from '../../models/comment.interface';
import { FromNowPipe } from '../../pipes/from-now.pipe';
import { IsReplyingPipe } from '../../pipes/is-replying.pipe';
import { IsEditingPipe } from '../../pipes/is-editing.pipe';
import { SafeResourceHTMLPipe } from '../../pipes/safe-resource-html.pipe';
import { ScrollCommentIntoViewDirective } from '../../directives/scroll-comment-into-view.directive';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';
import { ScrollEditorIntoViewDirective } from '../../directives/scroll-editor-into-view.directive';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { CommentBadgeComponent } from '../comment-badge/comment-badge.component';
import { FullTimestampPipe } from '../../pipes/full-timestamp.pipe';

@Component({
    selector: 'studio-lite-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.scss'],
    // eslint-disable-next-line max-len
    imports: [CommentBadgeComponent, CommentEditorComponent, ScrollEditorIntoViewDirective, MatIconButton, MatTooltip, WrappedIconComponent, ScrollCommentIntoViewDirective, TranslateModule, SafeResourceHTMLPipe, IsEditingPipe, IsReplyingPipe, FromNowPipe, FullTimestampPipe]
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
