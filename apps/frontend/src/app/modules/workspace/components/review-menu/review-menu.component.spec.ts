// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { ReviewMenuComponent } from './review-menu.component';

describe('ReviewMenuComponent', () => {
  let component: ReviewMenuComponent;
  let fixture: ComponentFixture<ReviewMenuComponent>;

  @Component({ selector: 'studio-lite-add-review-button', template: '' })
  class MockAddReviewButtonComponent {
    @Input() selectedReviewId!: number;
    @Input() workspaceId!: number;
    @Input() workspaceGroupId!: number;
    @Input() changed!: boolean;
  }

  @Component({ selector: 'studio-lite-delete-review-button', template: '' })
  class MockDeleteReviewButtonComponent {
    @Input() selectedReviewId!: number;
    @Input() workspaceId!: number;
  }

  @Component({ selector: 'studio-lite-start-review-button', template: '' })
  class MockStartReviewButtonComponent {
    @Input() selectedReviewId!: number;
    @Input() unitCount!: number;
  }

  @Component({ selector: 'studio-lite-export-review-button', template: '' })
  class MockExportReviewButtonComponent {
    @Input() bookletConfigSettings!: BookletConfigDto | undefined;
    @Input() workspaceId!: number;
    @Input() units!: number[];
    @Input() selectedReviewId!: number;
  }
  @Component({ selector: 'studio-lite-print-review-button', template: '' })
  class MockPrintReviewButtonComponent {
    @Input() workspaceId!: number;
    @Input() workspaceGroupId!: number;
    @Input() units!: number[];
    @Input() selectedReviewId!: number;
  }

  @Component({ selector: 'studio-lite-copy-review-link-button', template: '' })
  class MockCopyReviewLinkButtonComponent {
    @Input() link!: string;
    @Input() unitCount!: number;
    @Input() passwordLength!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ReviewMenuComponent,
        MockAddReviewButtonComponent,
        MockDeleteReviewButtonComponent,
        MockStartReviewButtonComponent,
        MockPrintReviewButtonComponent,
        MockCopyReviewLinkButtonComponent,
        MockExportReviewButtonComponent
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewMenuComponent);
    component = fixture.componentInstance;
    component.units = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
