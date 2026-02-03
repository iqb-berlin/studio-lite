import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { ReviewComponent } from './review.component';
import { ReviewService } from '../../services/review.service';
import { AppService } from '../../../../services/app.service';

describe('ReviewComponent', () => {
  let component: ReviewComponent;
  let fixture: ComponentFixture<ReviewComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockAppService: jest.Mocked<AppService>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

  beforeEach(async () => {
    mockReviewService = {
      reviewId: 0,
      units: [],
      bookletConfig: {
        unitScreenHeader: 'OFF',
        unitTitle: 'OFF',
        unitNaviButtons: 'OFF'
      },
      reviewConfig: {
        canComment: false
      },
      pageHeaderText: '',
      screenHeaderText: ''
    } as unknown as jest.Mocked<ReviewService>;

    mockAppService = {
      authData: { userId: 1 }
    } as unknown as jest.Mocked<AppService>;

    mockActivatedRoute = {
      snapshot: {
        params: { review: '123' }
      } as unknown as ActivatedRoute['snapshot']
    };

    await TestBed.configureTestingModule({
      imports: [
        ReviewComponent,
        TranslateModule.forRoot(),
        MatButtonModule,
        MatDialogModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AppService, useValue: mockAppService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should have appService accessible', () => {
      expect(component.appService).toBeDefined();
    });

    it('should have reviewService accessible', () => {
      expect(component.reviewService).toBeDefined();
    });
  });

  describe('ngOnInit()', () => {
    it('should set reviewId from route params when different and valid', fakeAsync(() => {
      mockReviewService.reviewId = 0;
      mockActivatedRoute.snapshot!.params = { review: '456' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.reviewId).toBe(456);
    }));

    it('should clear units array when reviewId changes', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockReviewService.units = [
        {
          databaseId: 1,
          sequenceId: 0,
          playerId: 'p1',
          responses: {},
          definition: 'd1',
          name: 'Unit 1'
        }
      ];
      mockActivatedRoute.snapshot!.params = { review: '456' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.units).toEqual([]);
      expect(mockReviewService.reviewId).toBe(456);
    }));

    it('should not change reviewId when it matches route param', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockActivatedRoute.snapshot!.params = { review: '123' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.reviewId).toBe(123);
      expect(mockReviewService.units).toBeDefined();
    }));

    it('should not clear units when reviewId has not changed', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockReviewService.units = [
        {
          databaseId: 1,
          sequenceId: 0,
          playerId: 'p1',
          responses: {},
          definition: 'd1',
          name: 'Unit 1'
        }
      ];
      mockActivatedRoute.snapshot!.params = { review: '123' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.units).toHaveLength(1);
      expect(mockReviewService.reviewId).toBe(123);
    }));

    it('should not update reviewId when newReviewId is 0', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockActivatedRoute.snapshot!.params = { review: '0' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.reviewId).toBe(123);
    }));

    it('should not update reviewId when newReviewId is negative', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockActivatedRoute.snapshot!.params = { review: '-5' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.reviewId).toBe(123);
    }));

    it('should not update reviewId when route param is invalid', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockActivatedRoute.snapshot!.params = { review: 'invalid' };

      component.ngOnInit();
      tick();

      expect(mockReviewService.reviewId).toBe(123);
    }));

    it('should not update reviewId when route param is missing', fakeAsync(() => {
      mockReviewService.reviewId = 123;
      mockActivatedRoute.snapshot!.params = {};

      component.ngOnInit();
      tick();

      expect(mockReviewService.reviewId).toBe(123);
    }));
  });

  describe('Template Bindings', () => {
    it('should bind appService in template', () => {
      fixture.detectChanges();
      expect(component.appService).toBe(mockAppService);
    });

    it('should bind reviewService in template', () => {
      fixture.detectChanges();
      expect(component.reviewService).toBe(mockReviewService);
    });
  });

  describe('Component Dependencies', () => {
    it('should inject AppService', () => {
      expect(component.appService).toBeDefined();
    });

    it('should inject ActivatedRoute', () => {
      const route = (component as unknown as { route: ActivatedRoute }).route;
      expect(route).toBeDefined();
    });

    it('should inject ReviewService', () => {
      expect(component.reviewService).toBeDefined();
    });
  });
});
