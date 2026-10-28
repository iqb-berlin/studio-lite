import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewTableComponent } from './review-table.component';

describe('ReviewTableComponent', () => {
  let component: ReviewTableComponent;
  let fixture: ComponentFixture<ReviewTableComponent>;

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
});
