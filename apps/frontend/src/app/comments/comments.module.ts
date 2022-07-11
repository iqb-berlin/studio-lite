import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { CommentComponent } from './components/comment/comment.component';
import { CommentEditorComponent } from './components/comment-editor/comment-editor.component';
import { CommentsComponent } from './components/comments/comments.component';
import { CommentsService } from './services/comments.service';
import { IsEditingPipe } from './pipes/is-editing.pipe';
import { IsReplyingPipe } from './pipes/is-replying.pipe';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { RootCommentsPipe } from './pipes/root-comments.pipe';
import { RepliesPipe } from './pipes/replies.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    TranslateModule,
    MatDialogModule,
    A11yModule
  ],
  declarations: [
    CommentsComponent,
    CommentComponent,
    CommentEditorComponent,
    IsEditingPipe,
    IsReplyingPipe,
    DeleteDialogComponent,
    RootCommentsPipe,
    RepliesPipe
  ],
  providers: [CommentsService],
  exports: [CommentsComponent]
})
export class CommentsModule {}
