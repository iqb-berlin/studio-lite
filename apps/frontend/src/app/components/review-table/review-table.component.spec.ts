import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { ReviewTableComponent } from './review-table.component';

describe('ReviewTableComponent', () => {
  let component: ReviewTableComponent;
  let fixture: ComponentFixture<ReviewTableComponent>;

  const mockReviews: ReviewDto[] = [
    {
      id: 1,
      name: 'Review 1',
      workspaceName: 'Workspace A',
      workspaceId: 101,
      changedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Review 2',
      workspaceName: 'Workspace B',
      workspaceId: 102,
      changedAt: new Date('2024-01-02')
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewTableComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty reviews array', () => {
    expect(component.reviews).toEqual([]);
  });

  it('should initialize with empty group name', () => {
    expect(component.groupName).toBe('');
  });

  it('should initialize with list view', () => {
    expect(component.reviewsView).toBe('list');
  });

  it('should initialize data source', () => {
    expect(component.dataSource).toBeTruthy();
    expect(component.dataSource.data).toEqual([]);
  });

  it('should have default displayed columns for list view', () => {
    expect(component.displayedColumns).toEqual(['name']);
  });

  it('should accept reviews input', () => {
    component.reviews = mockReviews;
    component.ngAfterViewInit();

    expect(component.dataSource.data).toEqual(mockReviews);
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should accept groupName input', () => {
    component.groupName = 'Test Group';
    fixture.detectChanges();

    expect(component.groupName).toBe('Test Group');
  });

  it('should toggle view from list to details', () => {
    expect(component.reviewsView).toBe('list');

    component.toggleView();

    expect(component.reviewsView).toBe('details');
  });

  it('should toggle view from details to list', () => {
    component.reviewsView = 'details';

    component.toggleView();

    expect(component.reviewsView).toBe('list');
  });

  it('should update displayed columns when toggling to details view', () => {
    component.reviewsView = 'list';
    component.toggleView();

    expect(component.displayedColumns).toEqual(['name', 'workspaceName', 'changedAt']);
  });

  it('should update displayed columns when toggling to list view', () => {
    component.reviewsView = 'details';
    component.toggleView();

    expect(component.displayedColumns).toEqual(['name']);
  });

  it('should toggle displayed columns directly', () => {
    component.reviewsView = 'list';
    component.toggleDisplayedColumns();

    expect(component.displayedColumns).toEqual(['name']);

    component.reviewsView = 'details';
    component.toggleDisplayedColumns();

    expect(component.displayedColumns).toEqual(['name', 'workspaceName', 'changedAt']);
  });

  it('should set data source sort after view init', () => {
    component.reviews = mockReviews;
    component.ngAfterViewInit();

    expect(component.dataSource.sort).toBe(component.sort);
  });

  it('should handle empty reviews array', () => {
    component.reviews = [];
    component.ngAfterViewInit();

    expect(component.dataSource.data).toEqual([]);
    expect(component.dataSource.data.length).toBe(0);
  });

  it('should update data source when reviews change', () => {
    component.reviews = mockReviews;
    component.ngAfterViewInit();

    expect(component.dataSource.data.length).toBe(2);

    component.reviews = [
      {
        id: 3,
        name: 'Review 3',
        workspaceName: 'Workspace C',
        workspaceId: 103,
        changedAt: new Date('2024-01-03')
      }
    ];
    component.ngAfterViewInit();

    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].name).toBe('Review 3');
  });

  it('should have i18nService injected', () => {
    expect(component.i18nService).toBeTruthy();
  });

  it('should handle multiple view toggles', () => {
    expect(component.reviewsView).toBe('list');

    component.toggleView();
    expect(component.reviewsView).toBe('details');

    component.toggleView();
    expect(component.reviewsView).toBe('list');

    component.toggleView();
    expect(component.reviewsView).toBe('details');
  });
});
