import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { FinishComponent } from './finish.component';
import { ReviewService } from '../../services/review.service';
import { environment } from '../../../../../environments/environment';
import { UnitData } from '../../models/unit-data.class';

describe('FinishComponent', () => {
  let component: FinishComponent;
  let fixture: ComponentFixture<FinishComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockTranslateService: jest.Mocked<TranslateService>;

  const createMockUnitData = (count: number): UnitData[] => Array.from({ length: count }, (_, i) => ({
    databaseId: i + 1,
    sequenceId: i,
    playerId: `player${i}`,
    responses: {},
    definition: `definition${i}`,
    name: `Unit ${i + 1}`
  }));

  beforeEach(async () => {
    mockReviewService = {
      units: [],
      currentUnitSequenceId: 0,
      loadReviewData: jest.fn().mockReturnValue(of(undefined)),
      setHeaderText: jest.fn()
    } as unknown as jest.Mocked<ReviewService>;

    mockTranslateService = {
      instant: jest.fn().mockReturnValue('End Page'),
      get: jest.fn().mockReturnValue(of('End Page')),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter()
    } as unknown as jest.Mocked<TranslateService>;

    await TestBed.configureTestingModule({
      imports: [
        FinishComponent,
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatButtonModule
      ],
      providers: [
        provideHttpClient(),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FinishComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should load review data when units array is empty', fakeAsync(() => {
      mockReviewService.units = [];

      component.ngOnInit();
      tick();

      expect(mockReviewService.loadReviewData).toHaveBeenCalled();
    }));

    it('should set currentUnitSequenceId to units length after loading data', fakeAsync(() => {
      mockReviewService.units = [];
      const mockUnits = createMockUnitData(5);
      mockReviewService.loadReviewData.mockReturnValue(of(undefined).pipe(
        () => {
          mockReviewService.units = mockUnits;
          return of(undefined);
        }
      ));

      component.ngOnInit();
      tick();

      expect(mockReviewService.currentUnitSequenceId).toBe(5);
    }));

    it('should not load review data when units array is not empty', fakeAsync(() => {
      mockReviewService.units = createMockUnitData(3);

      component.ngOnInit();
      tick();

      expect(mockReviewService.loadReviewData).not.toHaveBeenCalled();
    }));

    it('should set currentUnitSequenceId to units length when units already exist', fakeAsync(() => {
      mockReviewService.units = createMockUnitData(7);

      component.ngOnInit();
      tick();

      expect(mockReviewService.currentUnitSequenceId).toBe(7);
    }));

    it('should set header text with translated value', fakeAsync(() => {
      mockReviewService.units = createMockUnitData(2);
      mockTranslateService.instant.mockReturnValue('Test End Page');

      component.ngOnInit();
      tick();

      expect(mockTranslateService.instant).toHaveBeenCalledWith('review.end-page');
      expect(mockReviewService.setHeaderText).toHaveBeenCalledWith('Test End Page');
    }));

    it('should handle empty units array after loading', fakeAsync(() => {
      mockReviewService.units = [];

      component.ngOnInit();
      tick();

      expect(mockReviewService.currentUnitSequenceId).toBe(0);
    }));

    it('should use setTimeout for initialization', fakeAsync(() => {
      mockReviewService.units = [];
      const loadDataSpy = jest.spyOn(mockReviewService, 'loadReviewData');

      component.ngOnInit();

      expect(loadDataSpy).not.toHaveBeenCalled();

      tick();

      expect(loadDataSpy).toHaveBeenCalled();
    }));
  });

  describe('Component Dependencies', () => {
    it('should inject TranslateService', () => {
      const translateService = (component as unknown as { translateService: TranslateService }).translateService;
      expect(translateService).toBeDefined();
    });

    it('should inject ReviewService', () => {
      expect(component.reviewService).toBeDefined();
    });

    it('should have reviewService accessible in template', () => {
      expect(component.reviewService).toBe(mockReviewService);
    });
  });

  describe('Component Lifecycle', () => {
    it('should execute ngOnInit only once', fakeAsync(() => {
      mockReviewService.units = createMockUnitData(3);
      const setHeaderSpy = jest.spyOn(mockReviewService, 'setHeaderText');

      component.ngOnInit();
      tick();

      expect(setHeaderSpy).toHaveBeenCalledTimes(1);
    }));
  });
});
