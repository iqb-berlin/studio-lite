import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { ReviewDto } from '@studio-lite-lib/api-dto';
import { ReviewTableComponent } from './review-table.component';

describe('ReviewTableComponent', () => {
  let component: ReviewTableComponent;
  let fixture: ComponentFixture<ReviewTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewTableComponent,
        TranslateModule.forRoot()
      ],
      providers: [provideRouter([])]
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

  // The list view has no column headers, so a sort chosen in the details view could not be undone there.
  it('should order the reviews by name again when the details view is left', () => {
    const reviews: ReviewDto[] = [
      {
        id: 1, workspaceId: 1, name: 'Beta', changedAt: new Date(2026, 1, 1)
      },
      {
        id: 2, workspaceId: 1, name: 'Alpha', changedAt: new Date(2026, 0, 1)
      }
    ];
    const tableFixture = TestBed.createComponent(ReviewTableComponent);
    tableFixture.componentRef.setInput('reviews', reviews);
    tableFixture.detectChanges();
    const table = tableFixture.componentInstance;
    const shownNames = (): string[] => Array
      .from<HTMLElement>(tableFixture.nativeElement.querySelectorAll('.review-name'))
      .map(name => name.textContent?.trim() || '');

    table.toggleView();
    tableFixture.detectChanges();
    expect(shownNames()).toEqual(['Alpha', 'Beta']);

    table.sort.sort({ id: 'changedAt', start: 'desc', disableClear: true });
    tableFixture.detectChanges();
    expect(shownNames()).toEqual(['Beta', 'Alpha']);

    table.toggleView();
    tableFixture.detectChanges();
    expect(shownNames()).toEqual(['Alpha', 'Beta']);
  });
});
