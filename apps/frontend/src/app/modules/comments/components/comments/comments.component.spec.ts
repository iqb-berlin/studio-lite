// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { createMock } from '@golevelup/ts-jest';
import { CommentsComponent } from './comments.component';
import { BackendService } from '../../services/backend.service';
import { Comment } from '../../models/comment.interface';
import { ActiveComment } from '../../models/active-comment.interface';
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
  @Input() autoFocus = true;
  @Input() submitDisabled = false;
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
  @Input() replyDisabled = false;
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
  @Input() voteFilters: string[] = [];
  @Input() disabled = false;
  @Input() showHiddenComments!: Subject<boolean> | { value: boolean };
  @Output() filteredItemsChange = new EventEmitter<string[]>();
  @Output() voteFiltersChange = new EventEmitter<string[]>();
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
      updateComments: jest.fn().mockReturnValue(of(true)),
      toggleVote: jest.fn().mockReturnValue(of(true)),
      getCommentVoters: jest.fn().mockReturnValue(of([]))
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
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
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
          ],
          providers: [
            { provide: BackendService, useValue: backendServiceSpy },
            CommentService
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

  describe('focusEditor (#1785)', () => {
    const newCommentEditor = (): MockCommentEditorComponent => fixture.debugElement
      .query(By.css('.new-comment studio-lite-comment-editor')).componentInstance;

    it('should let the editor for a new comment take the focus by default', () => {
      expect(newCommentEditor().autoFocus).toBe(true);
    });

    it('should hand a switched-off focus on to the editor for a new comment', () => {
      fixture.componentRef.setInput('focusEditor', false);
      fixture.detectChanges();

      expect(newCommentEditor().autoFocus).toBe(false);
    });
  });

  describe('sending without a name (#1797)', () => {
    const newCommentEditor = (): MockCommentEditorComponent => fixture.debugElement
      .query(By.css('.new-comment studio-lite-comment-editor')).componentInstance;
    const rootComments = (): MockCommentComponent[] => fixture.debugElement
      .queryAll(By.directive(MockCommentComponent))
      .map(debugElement => debugElement.componentInstance);

    it('should let a new comment and replies be sent under a name', () => {
      fixture.componentRef.setInput('userName', 'John Doe');
      fixture.detectChanges();

      expect(newCommentEditor().submitDisabled).toBe(false);
      expect(rootComments().length).toBeGreaterThan(0);
      rootComments().forEach(comment => expect(comment.replyDisabled).toBe(false));
    });

    it('should keep a new comment and replies from being sent without a name', () => {
      fixture.componentRef.setInput('userName', '');
      fixture.detectChanges();

      expect(newCommentEditor().submitDisabled).toBe(true);
      expect(rootComments().length).toBeGreaterThan(0);
      rootComments().forEach(comment => expect(comment.replyDisabled).toBe(true));
    });
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

  // The success message opened right after the failure replaced it (#1962).
  it('should show only the failure when the visibility of a comment was not changed', () => {
    backendServiceSpy.updateCommentVisibility.mockReturnValueOnce(of(false));
    component.updateCommentVisibility(1, true);
    expect(snackBarSpy.open).toHaveBeenCalledTimes(1);
    expect(snackBarSpy.open).toHaveBeenCalledWith('comment.visibility-not-updated', 'error', { duration: 3000 });
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

  it('should say that an edit was not saved, and link no items to it', () => {
    backendServiceSpy.updateComment.mockReturnValueOnce(of(false));

    component.updateComment({ text: 'updated', commentId: 1, items: ['item1'] });

    expect(snackBarSpy.open).toHaveBeenCalledWith('comment.not-updated', 'error', { duration: 3000 });
    expect(backendServiceSpy.updateCommentItemConnections).not.toHaveBeenCalled();
  });

  it('should say that a comment was not sent, and link no items to it', () => {
    backendServiceSpy.createComment.mockReturnValueOnce(of(null));

    component.addComment({ text: 'new', parentId: null, items: ['item1'] });

    expect(snackBarSpy.open).toHaveBeenCalledWith('comment.not-sent', 'error', { duration: 3000 });
    expect(backendServiceSpy.updateCommentItemConnections).not.toHaveBeenCalled();
  });

  it.each([
    [0, 'comments.comment-delete-title', 'comments.comment-delete-question'],
    [2, 'comments.comments-delete-title', 'comments.comments-delete-question']
  ])('should ask about deleting a comment with %i replies in its own words', (numberOfReplies, title, content) => {
    component.deleteComment({ commentId: 1, numberOfReplies });

    expect(dialogSpy.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { title, content } })
    );
  });

  it.each([false, undefined])('should delete nothing when the delete dialog closes with %s', result => {
    dialogSpy.open.mockReturnValueOnce(createMock<MatDialogRef<unknown>>({ afterClosed: () => of(result) }));

    component.deleteComment({ commentId: 1, numberOfReplies: 0 });

    expect(backendServiceSpy.deleteComment).not.toHaveBeenCalled();
  });

  describe('opening the discussion', () => {
    const comment = (id: number, changedAt: string): Comment => createMock<Comment>({
      id, parentId: null, changedAt: new Date(changedAt)
    });

    const open = (inputs: { reviewId?: number; newCommentOnly?: boolean } = {}): CommentsComponent => {
      jest.clearAllMocks();
      const discussion = TestBed.createComponent(CommentsComponent);
      Object.entries({
        workspaceId: 1, unitId: 1, userId: 1, userName: 'user', ...inputs
      }).forEach(([name, value]) => discussion.componentRef.setInput(name, value));
      discussion.detectChanges();
      return discussion.componentInstance;
    };

    it('should mark the most recently changed comment as seen, wherever it is in the list', () => {
      backendServiceSpy.getComments.mockReturnValue(of([
        comment(1, '2024-01-02'), comment(2, '2024-03-01'), comment(3, '2024-01-01')
      ]));

      open();

      expect(backendServiceSpy.updateComments).toHaveBeenCalledWith(
        { lastSeenCommentChangedAt: new Date('2024-03-01'), userId: 1 }, 1, 1
      );
    });

    it('should not mark the comments of a review as seen, as a review has no workspace user', () => {
      const discussion = open({ reviewId: 5 });

      expect(discussion.comments).toHaveLength(2);
      expect(backendServiceSpy.updateComments).not.toHaveBeenCalled();
    });

    // The review's comment dialog closes on that announcement when the others' comments are not to be shown.
    it('should announce a sent comment without loading the others where only a new one may be written', () => {
      const discussion = open({ newCommentOnly: true });
      const updated = jest.fn();
      discussion.onCommentsUpdated.subscribe(updated);

      discussion.addComment({ text: 'new', parentId: null, items: [] });

      expect(backendServiceSpy.createComment).toHaveBeenCalled();
      expect(backendServiceSpy.getComments).not.toHaveBeenCalled();
      expect(updated).toHaveBeenCalledTimes(1);
    });
  });
});
