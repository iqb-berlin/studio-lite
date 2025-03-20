// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { BookletConfigDto, ReviewConfigDto } from '@studio-lite-lib/api-dto';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewConfigComponent } from './review-config.component';

describe('ReviewConfigComponent', () => {
  let component: ReviewConfigComponent;
  let fixture: ComponentFixture<ReviewConfigComponent>;

  @Component({ selector: 'studio-lite-booklet-config-edit', template: '', standalone: false })
  class MockBookletConfigEditComponent {
    @Input() disabled!: boolean;
    @Input() config!: BookletConfigDto | undefined;
  }

  @Component({ selector: 'studio-lite-review-config-edit', template: '', standalone: false })
  class MockReviewConfigEditComponent {
    @Input() disabled!: boolean;
    @Input() config!: ReviewConfigDto | undefined;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockBookletConfigEditComponent,
        MockReviewConfigEditComponent
      ],
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        NoopAnimationsModule,
        MatExpansionModule,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
