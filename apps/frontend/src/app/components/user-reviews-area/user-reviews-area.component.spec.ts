// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  Component, Input, Pipe, PipeTransform
} from '@angular/core';
import { UserReviewsAreaComponent } from './user-reviews-area.component';
import { UserIssue } from '../../models/user-issue.interface';

describe('UserReviewsAreaComponent', () => {
  let component: UserReviewsAreaComponent;
  let fixture: ComponentFixture<UserReviewsAreaComponent>;

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: false })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-user-issues', template: '', standalone: false })
  class MockUserIssuesComponent {
    @Input() issues!: UserIssue[];
  }

  @Pipe({ name: 'userIssues', standalone: false })
  class MockUserIssuesPipe implements PipeTransform {
    // eslint-disable-next-line class-methods-use-this
    transform() {
      return [];
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockAreaTitleComponent,
        MockUserIssuesComponent,
        MockUserIssuesPipe
      ],
      imports: [
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserReviewsAreaComponent);
    component = fixture.componentInstance;
    component.reviews = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
