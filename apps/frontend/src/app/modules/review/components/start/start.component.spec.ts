import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { StartComponent } from './start.component';
import { ReviewService } from '../../services/review.service';
import { AppService } from '../../../../services/app.service';

describe('StartComponent', () => {
  let component: StartComponent;
  let fixture: ComponentFixture<StartComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockAppService: jest.Mocked<AppService>;
  let mockTranslateService: jest.Mocked<TranslateService>;

  beforeEach(async () => {
    mockReviewService = {
      units: [],
      currentUnitSequenceId: 0,
      loadReviewData: jest.fn().mockReturnValue(of(undefined)),
      setHeaderText: jest.fn()
    } as unknown as jest.Mocked<ReviewService>;

    mockAppService = {
      appConfig: {
        hideTitlesOnPage: false
      }
    } as unknown as jest.Mocked<AppService>;

    mockTranslateService = {
      instant: jest.fn().mockReturnValue('Home Page'),
      get: jest.fn().mockReturnValue(of('Home Page')),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter()
    } as unknown as jest.Mocked<TranslateService>;

    await TestBed.configureTestingModule({
      imports: [
        StartComponent,
        TranslateModule.forRoot(),
        MatTooltipModule,
        MatExpansionModule,
        MatButtonModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AppService, useValue: mockAppService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should load review data when units array is empty', fakeAsync(() => {
      mockReviewService.units = [];

      component.ngOnInit();
      tick(100);

      expect(mockReviewService.loadReviewData).toHaveBeenCalled();
    }));

    it('should not load review data when units array is not empty', fakeAsync(() => {
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

      component.ngOnInit();
      tick(100);

      expect(mockReviewService.loadReviewData).not.toHaveBeenCalled();
    }));

    it('should set hideTitlesOnPage to true', fakeAsync(() => {
      mockReviewService.units = [];
      mockAppService.appConfig.hideTitlesOnPage = false;

      component.ngOnInit();
      tick(100);

      expect(mockAppService.appConfig.hideTitlesOnPage).toBe(true);
    }));

    it('should set header text with translated value', fakeAsync(() => {
      mockReviewService.units = [];
      mockTranslateService.instant.mockReturnValue('Test Home Page');

      component.ngOnInit();
      tick(100);

      expect(mockTranslateService.instant).toHaveBeenCalledWith('home.home-page');
      expect(mockReviewService.setHeaderText).toHaveBeenCalledWith('Test Home Page');
    }));

    it('should set currentUnitSequenceId to -1', fakeAsync(() => {
      mockReviewService.units = [];
      mockReviewService.currentUnitSequenceId = 5;

      component.ngOnInit();
      tick(100);

      expect(mockReviewService.currentUnitSequenceId).toBe(-1);
    }));

    it('should use setTimeout for initialization', fakeAsync(() => {
      mockReviewService.units = [];
      const loadDataSpy = jest.spyOn(mockReviewService, 'loadReviewData');

      component.ngOnInit();

      expect(loadDataSpy).not.toHaveBeenCalled();

      tick(100);

      expect(loadDataSpy).toHaveBeenCalled();
    }));

    it('should handle multiple units correctly', fakeAsync(() => {
      mockReviewService.units = [
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
        },
        {
          databaseId: 3,
          sequenceId: 2,
          playerId: 'p3',
          responses: {},
          definition: 'd3',
          name: 'Unit 3'
        }
      ];

      component.ngOnInit();
      tick(100);

      expect(mockReviewService.loadReviewData).not.toHaveBeenCalled();
      expect(mockReviewService.currentUnitSequenceId).toBe(-1);
    }));
  });

  describe('Component Dependencies', () => {
    it('should inject ReviewService', () => {
      expect(component.reviewService).toBeDefined();
    });

    it('should inject AppService', () => {
      const appService = (component as unknown as { appService: AppService }).appService;
      expect(appService).toBeDefined();
    });

    it('should inject TranslateService', () => {
      const translate = (component as unknown as { translate: TranslateService }).translate;
      expect(translate).toBeDefined();
    });

    it('should have reviewService accessible in template', () => {
      expect(component.reviewService).toBe(mockReviewService);
    });
  });
});
