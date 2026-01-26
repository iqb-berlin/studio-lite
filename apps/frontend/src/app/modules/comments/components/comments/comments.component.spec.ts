// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { CommentsComponent } from './comments.component';
import { BackendService } from '../../services/backend.service';
import { Comment } from '../../models/comment.interface';
import { ActiveComment, ActiveCommentType } from '../../models/active-comment.interface';
import { CommentService } from '../../services/comment.service';

@Pipe({
  name: 'filteredComments',
  standalone: true
})
class MockFilteredCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: Comment[]): Comment[] {
    return comments;
  }
}

@Pipe({
  name: 'filteredRootComments',
  standalone: true
})
class MockFilteredRootCommentsPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(comments: unknown[]): unknown[] {
    return comments;
  }
}

@Pipe({
  name: 'hiddenCommentsCount',
  standalone: true
})
class MockHiddenCommentsCountPipe implements PipeTransform {
  // eslint-disable-next-line class-methods-use-this
  transform(): number {
    return 0;
  }
}

@Component({
  selector: 'studio-lite-comment-editor',
  template: '',
  standalone: true
})
class MockCommentEditorComponent {
  @Input() submitLabel!: string;
  @Input() initialHTML!: string;
  @Input() editorHTML!: string;
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() unitItems: UnitItemDto[] = [];
  @Input() selectedItems: string[] = [];
  @Input() parentId: number | null = null;
  @Input() isProcessing = false;
  @Output() handleSubmit = new EventEmitter<{ text: string; parentId: number | null; items: string[] }>();
  @Output() handleCancel = new EventEmitter<void>();
}

@Component({
  selector: 'studio-lite-comment',
  template: '',
  standalone: true
})
class MockCommentComponent {
  @Input() comment!: Comment;
  @Input() activeComment!: ActiveComment | null;
  @Input() replies: Comment[] = [];
  @Input() userId!: number;
  @Input() unitItems: UnitItemDto[] = [];
  @Input() parentId: number | null = null;
  @Input() latestCommentId!: Subject<number>;
  @Input() scrollTargetId: Subject<number> | null = null;
  @Input() showHiddenComments!: Subject<boolean> | { value: boolean };
  @Input() adminMode = false;
  @Output() handleCancel = new EventEmitter<void>();
  @Output() handleDelete = new EventEmitter<{ commentId: number; numberOfReplies: number }>();
  @Output() handleSetActive = new EventEmitter<ActiveComment | null>();
  @Output() handleUpdate = new EventEmitter<{ text: string; commentId: number; items: string[] }>();
  @Output() handleToggleVisibility = new EventEmitter<Comment>();
}

@Component({
  selector: 'studio-lite-comment-filter',
  template: '',
  standalone: true
})
class MockCommentFilterComponent {
  @Input() unitItems: UnitItemDto[] = [];
  @Input() filteredItems: string[] = [];
  @Input() disabled = false;
  @Input() showHiddenComments!: Subject<boolean> | { value: boolean };
  @Output() filteredItemsChange = new EventEmitter<string[]>();
}

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;
  let backendServiceSpy: jest.Mocked<BackendService>;
  let dialogSpy: jest.Mocked<MatDialog>;
  let snackBarSpy: jest.Mocked<MatSnackBar>;

  const mockComments: Partial<Comment>[] = [
    {
      id: 1, body: 'root', userId: 1, parentId: null, changedAt: new Date('2023-01-01'), userName: 'user'
    },
    {
      id: 2, body: 'reply', userId: 1, parentId: 1, changedAt: new Date('2023-01-02'), userName: 'user'
    }
  ];

  beforeEach(async () => {
    backendServiceSpy = {
      getComments: jest.fn().mockReturnValue(of(mockComments as Comment[])),
      createComment: jest.fn().mockReturnValue(of(3)),
      updateComment: jest.fn().mockReturnValue(of(true)),
      updateCommentVisibility: jest.fn().mockReturnValue(of(true)),
      updateCommentItemConnections: jest.fn().mockReturnValue(of(true)),
      deleteComment: jest.fn().mockReturnValue(of(true)),
      updateComments: jest.fn().mockReturnValue(of(true))
    } as unknown as jest.Mocked<BackendService>;

    dialogSpy = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    } as unknown as jest.Mocked<MatDialog>;

    snackBarSpy = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CommentsComponent
      ],
      providers: [
        { provide: BackendService, useValue: backendServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        CommentService
      ]
    })
      .overrideComponent(CommentsComponent, {
        set: {
          imports: [
            TranslateModule,
            MockCommentComponent,
            MockCommentEditorComponent,
            MockCommentFilterComponent,
            MockFilteredCommentsPipe,
            MockFilteredRootCommentsPipe,
            MockHiddenCommentsCountPipe
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    component.workspaceId = 1;
    component.unitId = 1;
    component.userId = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch comments on init', fakeAsync(() => {
    component.ngOnInit();
    tick();
    expect(backendServiceSpy.getComments).toHaveBeenCalled();
    expect(component.comments.length).toBe(2);
    expect(component.rootCommentsWithReplies.length).toBe(1);
    expect(component.rootCommentsWithReplies[0].replies.length).toBe(1);
  }));

  it('should update comment visibility', () => {
    component.updateCommentVisibility(1, true);
    expect(backendServiceSpy.updateCommentVisibility).toHaveBeenCalledWith(
      1, { hidden: true, userId: 1 }, 1, 1, 0
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith('comment.visibility-updated', '', expect.any(Object));
  });

  it('should update comment', () => {
    component.updateComment({ text: 'updated', commentId: 1, items: ['item1'] });
    expect(backendServiceSpy.updateComment).toHaveBeenCalledWith(
      1, { body: 'updated', userId: 1 }, 1, 1, 0
    );
    expect(backendServiceSpy.updateCommentItemConnections).toHaveBeenCalledWith(
      { userId: 1, unitItemUuids: ['item1'] }, 1, 1, 0, 1
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith('comment.updated', '', expect.any(Object));
  });

  it('should add comment', () => {
    component.userName = 'user1';
    component.addComment({ text: 'new', parentId: null, items: ['item1'] });
    expect(backendServiceSpy.createComment).toHaveBeenCalledWith(
      {
        body: 'new', userName: 'user1', userId: 1, parentId: null, unitId: 1
      }, 1, 1, 0
    );
    expect(backendServiceSpy.updateCommentItemConnections).toHaveBeenCalled();
    expect(snackBarSpy.open).toHaveBeenCalledWith('comment.sent', '', expect.any(Object));
  });

  it('should delete comment', () => {
    component.deleteComment({ commentId: 1, numberOfReplies: 0 });
    expect(dialogSpy.open).toHaveBeenCalled();
    expect(backendServiceSpy.deleteComment).toHaveBeenCalledWith(1, 1, 1, 0);
  });

  it('should toggle visibility', () => {
    const spy = jest.spyOn(component, 'updateCommentVisibility');
    component.toggleVisibility({ id: 1, hidden: false } as unknown as Comment);
    expect(spy).toHaveBeenCalledWith(1, true);
  });

  it('should set active comment', () => {
    const mockActive: ActiveComment = { id: 1, type: ActiveCommentType.replying };
    component.setActiveComment(mockActive);
    expect(component.activeComment).toBe(mockActive);
  });
});
