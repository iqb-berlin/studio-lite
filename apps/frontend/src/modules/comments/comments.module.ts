import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { A11yModule } from '@angular/cdk/a11y';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxTiptapModule } from 'ngx-tiptap';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommentComponent } from './components/comment/comment.component';
import { CommentEditorComponent } from './components/comment-editor/comment-editor.component';
import { CommentsComponent } from './components/comments/comments.component';
import { BackendService } from './services/backend.service';
import { IsEditingPipe } from './pipes/is-editing.pipe';
import { IsReplyingPipe } from './pipes/is-replying.pipe';
import { DeleteDialogComponent } from './components/delete-dialog/delete-dialog.component';
import { RootCommentsPipe } from './pipes/root-comments.pipe';
import { RepliesPipe } from './pipes/replies.pipe';
import { SafeResourceHTMLPipe } from './pipes/safe-resource-html.pipe';
import { ScrollCommentIntoViewDirective } from './directives/scroll-comment-into-view.directive';
import { AuthInterceptor } from '../../app/interceptors/auth.interceptor';
import { CommentBadgeComponent } from './components/comment-badge/comment-badge.component';
import { ScrollEditorIntoViewDirective } from './directives/scroll-editor-into-view.directive';
import { MomentFromNowPipe } from './pipes/moment-from-now.pipe';
import { Comment } from './types/comment';
import { IsCommentCommittablePipe } from './pipes/is-comment-commitable.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    MatDialogModule,
    A11yModule,
    MatSelectModule,
    MatMenuModule,
    MatTooltipModule,
    NgxTiptapModule,
    FormsModule,
    MatInputModule,
    FlexLayoutModule
  ],
  declarations: [
    CommentsComponent,
    CommentComponent,
    CommentEditorComponent,
    SafeResourceHTMLPipe,
    IsEditingPipe,
    IsReplyingPipe,
    DeleteDialogComponent,
    RootCommentsPipe,
    RepliesPipe,
    ScrollCommentIntoViewDirective,
    ScrollEditorIntoViewDirective,
    CommentBadgeComponent,
    MomentFromNowPipe,
    IsCommentCommittablePipe
  ],
  exports: [
    CommentsComponent
  ],
  providers: [
    BackendService,
    [
      { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ]
  ]
})
export class CommentsModule {}
export { Comment };
