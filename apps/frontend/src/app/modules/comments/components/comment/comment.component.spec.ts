// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { Comment } from '../../models/comment.interface';
import { CommentComponent } from './comment.component';
import { ActiveComment } from '../../models/active-comment.interface';
import { WrappedIconComponent } from '../../../shared/components/wrapped-icon/wrapped-icon.component';

describe('CommentBadgeComponent', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;

  @Pipe({
    name: 'momentFromNow'
  })
  class MockMomentFromNowPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(date: Date): string {
      return date.toString();
    }
  }
  @Pipe({
    name: 'isEditing'
  })
  class MockIsEditingPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
    transform(activeComment: ActiveComment | null, comment: Comment): boolean {
      return false;
    }
  }

  @Pipe({
    name: 'isReplying'
  })
  class MockIsReplyingPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
    transform(activeComment: ActiveComment | null, comment: Comment): boolean {
      return false;
    }
  }

  @Pipe({
    name: 'safeResourceHTML'
  })
  class MockSafeResourceHTMLPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform(resourceHTML: string): SafeHtml {
      return resourceHTML as SafeHtml;
    }
  }

  @Component({ selector: 'studio-lite-comment-badge', template: '' })
  class MockCommentBadgeComponent {
    @Input() userName!: string;
    @Input() ownComment!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CommentComponent,
        MockCommentBadgeComponent,
        MockMomentFromNowPipe,
        MockIsEditingPipe,
        MockIsReplyingPipe,
        MockSafeResourceHTMLPipe,
        WrappedIconComponent
      ],
      imports: [
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
      userId: 1,
      unitId: 1,
      parentId: null,
      createdAt: new Date(),
      changedAt: new Date()
    };
    component.replies = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
