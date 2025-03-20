// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ReviewsComponent } from './reviews.component';
import { environment } from '../../../../../environments/environment';

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;

  @Component({ selector: 'studio-lite-review-menu', template: '', standalone: false })
  class MockReviewMenuComponent {
    @Input() selectedReviewId!: number;
    @Input() changed!: boolean;
    @Input() units!: number[];
    @Input() workspaceId!: number;
    @Input() workspaceGroupId!: number;
    @Input() link!: string;
    @Input() passwordLength!: number;
    @Input() bookletConfigSettings!: BookletConfigDto | undefined;
  }

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: false })
  class MockSelectUnitListComponent {
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() selectedUnitIds!: number[];
    @Input() workspace!: number;
    @Input() disabled!: number[];
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  @Component({ selector: 'studio-lite-review-config', template: '', standalone: false })
  class MockReviewConfigComponent {
    @Input() selectedReviewId!: number;
    @Input() name!: string | undefined;
    @Input() password!: string | undefined;
    @Input() bookletConfigSettings!: BookletConfigDto | undefined;
    @Input() reviewConfigSettings!: ReviewConfigDto | undefined;
  }

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-save-changes', template: '', standalone: false })
  class MockSaveChangesComponent {
    @Input() changed!: boolean;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockReviewMenuComponent,
        MockSelectUnitListComponent,
        MockReviewConfigComponent,
        MockSaveChangesComponent,
        MockSearchFilterComponent
      ],
      imports: [
        MatTableModule,
        MatSortModule,
        MatDialogModule,
        MatSnackBarModule,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
