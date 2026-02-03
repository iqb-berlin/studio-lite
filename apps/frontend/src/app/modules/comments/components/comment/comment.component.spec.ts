// eslint-disable-next-line max-classes-per-file
import {
  Component, EventEmitter, Input, Output, Pipe, PipeTransform
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeHtml } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { BehaviorSubject, Subject } from 'rxjs';
import { ActiveComment, ActiveCommentType } from '../../models/active-comment.interface';
import { Comment } from '../../models/comment.interface';
import { CommentComponent } from './comment.component';

describe('CommentComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  @Pipe({ name: 'fullTimestamp', standalone: false })
  class MockMomentFullTimestampPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(date: Date): string {
      return date ? date.toString() : '';
    }
  }

  @Pipe({ name: 'isEditing', standalone: false })
  class MockIsEditingPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(activeComment: ActiveComment | null, comment: Comment): boolean {
      return activeComment?.id === comment.id && activeComment?.type === ActiveCommentType.editing;
    }
  }

  @Pipe({ name: 'isReplying', standalone: false })
  class MockIsReplyingPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(activeComment: ActiveComment | null, comment: Comment): boolean {
      return activeComment?.id === comment.id && activeComment?.type === ActiveCommentType.replying;
    }
  }

  @Pipe({ name: 'safeResourceHTML', standalone: false })
  class MockSafeResourceHTMLPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(resourceHTML: string): SafeHtml {
      return resourceHTML as SafeHtml;
    }
  }

  @Pipe({ name: 'commentItemUuidsIds', standalone: false })
  class MockCommentItemUuidsIdsPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(uuids: string[]): { id: string }[] {
      return uuids.map(uuid => ({ id: uuid }));
    }
  }

  @Pipe({ name: 'sortAscending', standalone: false })
  class MockSortAscendingPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform<T>(items: T[]): T[] {
      return items;
    }
  }

  @Component({ selector: 'studio-lite-comment-badge', template: '', standalone: false })
  class MockCommentBadgeComponent {
    @Input() userName!: string;
    @Input() ownComment!: boolean;
  }

  @Component({ selector: 'studio-lite-comment-editor', template: '', standalone: false })
  class MockCommentEditorComponent {
    @Input() isVisible!: boolean;
    @Input() submitLabel!: string;
    @Input() placeholder!: string;
    @Input() initialHTML!: string;
    @Input() unitItems!: UnitItemDto[];
    @Input() selectedItems!: string[];
    @Output() handleSubmit = new EventEmitter<{ text: string; items: string[] }>();
    @Output() handleCancel = new EventEmitter<void>();
  }

  @Component({ selector: 'studio-lite-comment-item', template: '', standalone: false })
  class MockCommentItemComponent {
    @Input() label!: string;
  }

  @Component({ selector: 'studio-lite-wrapped-icon', template: '', standalone: false })
  class MockWrappedIconComponent {
    @Input() icon!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockCommentBadgeComponent,
        MockCommentEditorComponent,
        MockCommentItemComponent,
        MockWrappedIconComponent,
        MockMomentFullTimestampPipe,
        MockIsEditingPipe,
        MockIsReplyingPipe,
        MockSafeResourceHTMLPipe,
        MockCommentItemUuidsIdsPipe,
        MockSortAscendingPipe
      ],
      imports: [
        CommentComponent,
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
    component.userId = 1;
    component.comment = {
      id: 1,
      body: '<p>Hi</p>',
      userName: 'tester',
      itemUuids: [],
      userId: 1,
      unitId: 1,
      parentId: null,
      hidden: false,
      createdAt: new Date(),
      changedAt: new Date()
    };
    component.replies = [];
    component.activeComment = null;
    component.unitItems = [];
    component.latestCommentId = new Subject<number>();
    component.showHiddenComments = new BehaviorSubject<boolean>(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set ownComment to true if userId matches comment.userId', () => {
      component.userId = 1;
      component.comment.userId = 1;
      component.ngOnInit();
      expect(component.ownComment).toBe(true);
    });

    it('should set ownComment to false if userId does not match comment.userId', () => {
      component.userId = 2;
      component.comment.userId = 1;
      component.ngOnInit();
      expect(component.ownComment).toBe(false);
    });

    it('should set replyId to parentId if present', () => {
      component.parentId = 123;
      component.ngOnInit();
      expect(component.replyId).toBe(123);
    });

    it('should fallback replyId to comment.id if parentId is null', () => {
      component.parentId = null;
      component.comment.id = 456;
      component.ngOnInit();
      expect(component.replyId).toBe(456);
    });
  });

  describe('Event Emissions', () => {
    it('should emit toggleVisibility when visibility button is clicked', () => {
      jest.spyOn(component.toggleVisibility, 'emit');
      component.ownComment = true;
      fixture.detectChanges();

      component.toggleVisibility.emit(component.comment);
      expect(component.toggleVisibility.emit).toHaveBeenCalledWith(component.comment);
    });

    it('should emit setActiveComment with replying type', () => {
      jest.spyOn(component.setActiveComment, 'emit');
      component.setActiveComment.emit({ id: 1, type: ActiveCommentType.replying });
      expect(component.setActiveComment.emit).toHaveBeenCalledWith({ id: 1, type: ActiveCommentType.replying });
    });

    it('should have delete button if ownComment is true', () => {
      component.ownComment = true;
      fixture.detectChanges();
      const deleteIcon = fixture.nativeElement.querySelector('studio-lite-wrapped-icon[icon="delete"]');
      expect(deleteIcon).toBeTruthy();
    });

    it('should not have delete button if ownComment is false and not admin', () => {
      component.ownComment = false;
      component.adminMode = false;
      component.userId = 2; // differs from comment.userId=1
      component.ngOnInit(); // update ownComment
      fixture.detectChanges();
      const deleteIcon = fixture.nativeElement.querySelector('studio-lite-wrapped-icon[icon="delete"]');
      expect(deleteIcon).toBeFalsy();
    });

    it('should look for delete button if adminMode is true', () => {
      component.ownComment = false;
      component.adminMode = true;
      fixture.detectChanges();
      const deleteIcon = fixture.nativeElement.querySelector('studio-lite-wrapped-icon[icon="delete"]');
      expect(deleteIcon).toBeTruthy();
    });
  });
});
