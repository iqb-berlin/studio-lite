// eslint-disable-next-line max-classes-per-file
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { ReviewMenuComponent } from './review-menu.component';
import { environment } from '../../../../../environments/environment';

describe('ReviewMenuComponent', () => {
  let component: ReviewMenuComponent;
  let fixture: ComponentFixture<ReviewMenuComponent>;

  @Component({ selector: 'studio-lite-add-review-button', template: '', standalone: false })
  class MockAddReviewButtonComponent {
    @Input() selectedReviewId!: number;
    @Input() workspaceId!: number;
    @Input() workspaceGroupId!: number;
    @Input() changed!: boolean;
  }

  @Component({ selector: 'studio-lite-delete-review-button', template: '', standalone: false })
  class MockDeleteReviewButtonComponent {
    @Input() selectedReviewId!: number;
    @Input() workspaceId!: number;
  }

  @Component({ selector: 'studio-lite-start-review-button', template: '', standalone: false })
  class MockStartReviewButtonComponent {
    @Input() selectedReviewId!: number;
    @Input() unitCount!: number;
  }

  @Component({ selector: 'studio-lite-export-review-button', template: '', standalone: false })
  class MockExportReviewButtonComponent {
    @Input() bookletConfigSettings!: BookletConfigDto | undefined;
    @Input() workspaceId!: number;
    @Input() units!: number[];
    @Input() selectedReviewId!: number;
  }
  @Component({ selector: 'studio-lite-print-review-button', template: '', standalone: false })
  class MockPrintReviewButtonComponent {
    @Input() workspaceId!: number;
    @Input() workspaceGroupId!: number;
    @Input() units!: number[];
    @Input() selectedReviewId!: number;
  }

  @Component({ selector: 'studio-lite-copy-review-link-button', template: '', standalone: false })
  class MockCopyReviewLinkButtonComponent {
    @Input() link!: string;
    @Input() unitCount!: number;
    @Input() passwordLength!: number;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockAddReviewButtonComponent,
        MockDeleteReviewButtonComponent,
        MockStartReviewButtonComponent,
        MockPrintReviewButtonComponent,
        MockCopyReviewLinkButtonComponent,
        MockExportReviewButtonComponent
      ],
      imports: [
        HttpClientModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
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
