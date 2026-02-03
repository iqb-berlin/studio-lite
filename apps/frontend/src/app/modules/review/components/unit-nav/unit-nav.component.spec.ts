import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BackendService } from '../../../comments/services/backend.service';
import { UnitNavComponent } from './unit-nav.component';
import { ReviewService } from '../../services/review.service';
import { environment } from '../../../../../environments/environment';

describe('UnitNavComponent', () => {
  let component: UnitNavComponent;
  let fixture: ComponentFixture<UnitNavComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;

  beforeEach(async () => {
    mockReviewService = {
      units: [],
      currentUnitSequenceId: 0,
      reviewConfig: { showOthersComments: false },
      bookletConfig: { controllerDesign: '' },
      setUnitNavigationRequest: jest.fn()
    } as unknown as jest.Mocked<ReviewService>;

    await TestBed.configureTestingModule({
      imports: [
        UnitNavComponent,
        TranslateModule.forRoot(),
        MatListModule,
        MatTooltipModule,
        MatIconModule,
        MatButtonModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        BackendService,
        { provide: ReviewService, useValue: mockReviewService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should have reviewService injected', () => {
      expect(component.reviewService).toBeDefined();
    });

    it('should have reviewService accessible in template', () => {
      expect(component.reviewService).toBe(mockReviewService);
    });
  });

  describe('ReviewService Integration', () => {
    it('should access units from reviewService', () => {
      const mockUnits = [
        {
          databaseId: 1,
          sequenceId: 0,
          playerId: 'p1',
          responses: {},
          definition: 'd1',
          name: 'Unit 1'
        },
        {
          databaseId: 2,
          sequenceId: 1,
          playerId: 'p2',
          responses: {},
          definition: 'd2',
          name: 'Unit 2'
        }
      ];
      mockReviewService.units = mockUnits;

      expect(component.reviewService.units).toEqual(mockUnits);
      expect(component.reviewService.units.length).toBe(2);
    });

    it('should access currentUnitSequenceId from reviewService', () => {
      mockReviewService.currentUnitSequenceId = 5;

      expect(component.reviewService.currentUnitSequenceId).toBe(5);
    });

    it('should access reviewConfig from reviewService', () => {
      mockReviewService.reviewConfig = { showOthersComments: true };

      expect(component.reviewService.reviewConfig.showOthersComments).toBe(true);
    });
  });

  describe('Template Binding', () => {
    it('should bind reviewService for template access', () => {
      fixture.detectChanges();
      expect(component.reviewService).toBe(mockReviewService);
    });

    it('should handle empty units array in reviewService', () => {
      mockReviewService.units = [];
      fixture.detectChanges();

      expect(component.reviewService.units).toEqual([]);
    });
  });
});
