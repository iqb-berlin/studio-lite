// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { CommentsComponent } from './comments.component';
import { BackendService } from '../../services/backend.service';
import { Comment } from '../../models/comment.interface';
import { ActiveComment } from '../../models/active-comment.interface';

describe('UnitCommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;

  @Pipe({
    name: 'rootComments',
    standalone: false
  })
  class MockRootCommentsPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(comments: Comment[]): Comment[] {
      return comments;
    }
  }

  @Component({ selector: 'studio-lite-comment-editor', template: '', standalone: false })
  class MockCommentEditorComponent {
    @Input() submitLabel!: string;
    @Input() initialHTML!: string;
    @Input() editorHTML!: string;
    @Input() label!: string;
  }

  @Component({ selector: 'studio-lite-comment', template: '', standalone: false })
  class MockCommentComponent {
    @Input() comment!: Comment;
    @Input() activeComment!: ActiveComment | null;
    @Input() replies!: Comment[];
    @Input() userId!: number;
    @Input() parentId!: number | null;
    @Input() latestCommentId!: Subject<number>;
    @Input() adminMode!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockRootCommentsPipe,
        MockCommentEditorComponent,
        MockCommentComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MatDialogModule
      ],
      providers: [
        provideHttpClient(),
        BackendService,
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
