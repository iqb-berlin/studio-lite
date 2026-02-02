// eslint-disable-next-line max-classes-per-file
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { UserReviewsAreaComponent } from './user-reviews-area.component';

describe('UserReviewsAreaComponent', () => {
  let component: UserReviewsAreaComponent;
  let fixture: ComponentFixture<UserReviewsAreaComponent>;

  @Component({ selector: 'studio-lite-area-title', template: '', standalone: true })
  class MockAreaTitleComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-review-table', template: '', standalone: true })
  class MockReviewTableComponent {
    @Input() reviews!: ReviewDto[];
    @Input() groupName!: string;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MockAreaTitleComponent,
        MockReviewTableComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserReviewsAreaComponent);
    component = fixture.componentInstance;
    component.reviews = [];
    component.isReviewUser = false;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should accept reviews input', () => {
    const mockReviews: ReviewDto[] = [{
      id: 1,
      name: 'Review 1',
      workspaceId: 1,
      workspaceGroupId: 1,
      workspaceGroupName: 'Group A'
    }];
    component.reviews = mockReviews;
    fixture.detectChanges();

    expect(component.reviews).toEqual(mockReviews);
  });

  it('should accept isReviewUser input', () => {
    component.isReviewUser = true;
    fixture.detectChanges();

    expect(component.isReviewUser).toBe(true);
  });

  it('should initialize with empty groupedReviews', () => {
    expect(component.groupedReviews).toEqual([]);
  });

  it('should group reviews by workspace group on ngOnInit', () => {
    component.reviews = [
      {
        id: 1, name: 'Review 1', workspaceId: 1, workspaceGroupId: 1, workspaceGroupName: 'Group A'
      },
      {
        id: 2, name: 'Review 2', workspaceId: 2, workspaceGroupId: 1, workspaceGroupName: 'Group A'
      },
      {
        id: 3, name: 'Review 3', workspaceId: 3, workspaceGroupId: 2, workspaceGroupName: 'Group B'
      }
    ];

    component.ngOnInit();

    expect(component.groupedReviews.length).toBe(2);
    expect(component.groupedReviews[0].groupName).toBe('Group A');
    expect(component.groupedReviews[0].reviews.length).toBe(2);
    expect(component.groupedReviews[1].groupName).toBe('Group B');
    expect(component.groupedReviews[1].reviews.length).toBe(1);
  });

  it('should sort grouped reviews by group name alphabetically', () => {
    component.reviews = [
      {
        id: 1, name: 'Review 1', workspaceId: 1, workspaceGroupId: 2, workspaceGroupName: 'Zebra'
      },
      {
        id: 2, name: 'Review 2', workspaceId: 2, workspaceGroupId: 1, workspaceGroupName: 'Alpha'
      }
    ];

    component.ngOnInit();

    expect(component.groupedReviews[0].groupName).toBe('Alpha');
    expect(component.groupedReviews[1].groupName).toBe('Zebra');
  });

  it('should handle reviews without group name', () => {
    component.reviews = [{
      id: 1, name: 'Review 1', workspaceId: 1, workspaceGroupId: 0
    }];

    component.ngOnInit();

    expect(component.groupedReviews.length).toBe(1);
    expect(component.groupedReviews[0].groupName).toBe('');
    expect(component.groupedReviews[0].groupId).toBe(0);
  });

  it('should handle empty reviews array', () => {
    component.reviews = [];

    component.ngOnInit();

    expect(component.groupedReviews).toEqual([]);
  });

  it('should group reviews by groupId when groupId is the same', () => {
    component.reviews = [
      {
        id: 1, name: 'Review 1', workspaceId: 1, workspaceGroupId: 5, workspaceGroupName: 'Test Group'
      },
      {
        id: 2, name: 'Review 2', workspaceId: 2, workspaceGroupId: 5, workspaceGroupName: 'Test Group'
      }
    ];

    component.ngOnInit();

    expect(component.groupedReviews.length).toBe(1);
    expect(component.groupedReviews[0].groupId).toBe(5);
    expect(component.groupedReviews[0].reviews.length).toBe(2);
  });
});
