/* eslint-disable @typescript-eslint/dot-notation */
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ReviewService } from './review.service';
import { ReviewBackendService } from './review-backend.service';
import { ModuleService } from '../../shared/services/module.service';
import { AppService } from '../../../services/app.service';
import { I18nService } from '../../../services/i18n.service';
import { environment } from '../../../../environments/environment';
import { Comment } from '../../comments/models/comment.interface';

describe('ReviewService', () => {
  let service: ReviewService;
  let mockRouter: jest.Mocked<Router>;
  let mockBackendService: jest.Mocked<ReviewBackendService>;
  let mockModuleService: jest.Mocked<ModuleService>;
  let mockAppService: jest.Mocked<AppService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockI18nService: jest.Mocked<I18nService>;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    mockBackendService = {
      getReview: jest.fn(),
      getUnitComments: jest.fn()
    } as unknown as jest.Mocked<ReviewBackendService>;

    mockModuleService = {
      loadList: jest.fn().mockResolvedValue([])
    } as unknown as jest.Mocked<ModuleService>;

    mockAppService = {
      appConfig: {
        setPageTitle: jest.fn()
      }
    } as unknown as jest.Mocked<AppService>;

    mockTranslateService = {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      instant: jest.fn((key: string, params?: Record<string, unknown>) => {
        if (key === 'review.booklet' && params) {
          return `Booklet: ${params['name']}`;
        }
        if (key === 'review.block' && params) {
          return `Block: ${params['name']}`;
        }
        if (key === 'review.info' && params) {
          return `${params['workspace']} - ${params['workspaceGroup']}`;
        }
        if (key === 'review.unit' && params) {
          return `Unit ${params['index']}`;
        }
        if (key === 'review.header') {
          return 'Review Header';
        }
        return key;
      })
    } as unknown as jest.Mocked<TranslateService>;

    mockI18nService = {
      fullLocale: 'en-US',
      dateTimeFormat: 'short'
    } as unknown as jest.Mocked<I18nService>;

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        ReviewService,
        provideHttpClient(),
        { provide: Router, useValue: mockRouter },
        { provide: ReviewBackendService, useValue: mockBackendService },
        { provide: ModuleService, useValue: mockModuleService },
        { provide: AppService, useValue: mockAppService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    });
    service = TestBed.inject(ReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      expect(service.reviewId).toBe(0);
      expect(service.reviewName).toBe('');
      expect(service.reviewCreatedAt).toBe('');
      expect(service.reviewChangedAt).toBe('');
      expect(service.workspaceId).toBe(0);
      expect(service.workspaceName).toBe('');
      expect(service.units).toEqual([]);
      expect(service.reviewConfig).toEqual({});
      expect(service.bookletConfig).toEqual({});
      expect(service.screenHeaderText).toBe('');
      expect(service.pageHeaderText).toBe('');
      expect(service.currentUnitSequenceId).toBe(-1);
      expect(service.unitInfoPanelWidth).toBe(300);
      expect(service.unitInfoPanelOn).toBe(false);
      expect(service.allComments).toEqual([]);
    });
  });

  describe('unitDbId getter', () => {
    it('should return 0 when units array is empty', () => {
      service.units = [];
      service.currentUnitSequenceId = 0;
      expect(service.unitDbId).toBe(0);
    });

    it('should return 0 when no matching unit is found', () => {
      service.units = [
        {
          databaseId: 100,
          sequenceId: 0,
          playerId: 'p1',
          responses: {},
          definition: 'd1',
          name: 'Unit 1'
        }
      ];
      service.currentUnitSequenceId = 5;
      expect(service.unitDbId).toBe(0);
    });

    it('should return database id when matching unit is found', () => {
      service.units = [
        {
          databaseId: 100,
          sequenceId: 0,
          playerId: 'p1',
          responses: {},
          definition: 'd1',
          name: 'Unit 1'
        },
        {
          databaseId: 200,
          sequenceId: 1,
          playerId: 'p2',
          responses: {},
          definition: 'd2',
          name: 'Unit 2'
        }
      ];
      service.currentUnitSequenceId = 1;
      expect(service.unitDbId).toBe(200);
    });

    it('should return first matching unit when multiple units have same sequenceId', () => {
      service.units = [
        {
          databaseId: 100,
          sequenceId: 0,
          playerId: 'p1',
          responses: {},
          definition: 'd1',
          name: 'Unit 1'
        },
        {
          databaseId: 200,
          sequenceId: 0,
          playerId: 'p2',
          responses: {},
          definition: 'd2',
          name: 'Unit 2'
        }
      ];
      service.currentUnitSequenceId = 0;
      expect(service.unitDbId).toBe(100);
    });
  });

  describe('setUnitNavigationRequest', () => {
    beforeEach(() => {
      service.reviewId = 123;
      service.units = [
        {
          databaseId: 1, sequenceId: 0, playerId: 'p1', responses: {}, definition: 'd1', name: 'Unit 1'
        },
        {
          databaseId: 2, sequenceId: 1, playerId: 'p2', responses: {}, definition: 'd2', name: 'Unit 2'
        },
        {
          databaseId: 3, sequenceId: 2, playerId: 'p3', responses: {}, definition: 'd3', name: 'Unit 3'
        }
      ];
    });

    it('should navigate to start page when targetUnitId is negative', () => {
      service.setUnitNavigationRequest(-1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/start']);
    });

    it('should navigate to start page when targetUnitId is -5', () => {
      service.setUnitNavigationRequest(-5);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/start']);
    });

    it('should navigate to end page when targetUnitId equals units length', () => {
      service.setUnitNavigationRequest(3);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/end']);
    });

    it('should navigate to end page when targetUnitId exceeds units length', () => {
      service.setUnitNavigationRequest(10);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/end']);
    });

    it('should navigate to unit page when targetUnitId is valid', () => {
      service.setUnitNavigationRequest(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/u/1']);
    });

    it('should navigate to first unit when targetUnitId is 0', () => {
      service.setUnitNavigationRequest(0);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/u/0']);
    });

    it('should navigate to last unit when targetUnitId is last valid index', () => {
      service.setUnitNavigationRequest(2);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/review/123/u/2']);
    });
  });

  describe('setHeaderText', () => {
    beforeEach(() => {
      service.reviewName = 'Test Review';
    });

    it('should set pageHeaderText to the provided pageName', () => {
      service.setHeaderText('Test Page');
      expect(service.pageHeaderText).toBe('Test Page');
    });

    it('should set screenHeaderText to pageName when unitScreenHeader is WITH_UNIT_TITLE', () => {
      service.bookletConfig = { unitScreenHeader: 'WITH_UNIT_TITLE' };
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('Test Page');
    });

    it('should set screenHeaderText with booklet title when unitScreenHeader is WITH_BOOKLET_TITLE', () => {
      service.bookletConfig = { unitScreenHeader: 'WITH_BOOKLET_TITLE' };
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('Booklet: Test Review');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('review.booklet', { name: 'Test Review' });
    });

    it('should set screenHeaderText with block title when unitScreenHeader is WITH_BLOCK_TITLE', () => {
      service.bookletConfig = { unitScreenHeader: 'WITH_BLOCK_TITLE' };
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('Block: Test Review');
      expect(mockTranslateService.instant).toHaveBeenCalledWith('review.block', { name: 'Test Review' });
    });

    it('should set screenHeaderText to empty string when unitScreenHeader is OFF', () => {
      service.bookletConfig = { unitScreenHeader: 'OFF' };
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('');
    });

    it('should set screenHeaderText to empty string when unitScreenHeader is undefined', () => {
      service.bookletConfig = {};
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('');
    });

    it('should set screenHeaderText to empty string when bookletConfig is null', () => {
      service.bookletConfig = null as unknown as Record<string, unknown>;
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('');
    });

    it('should set screenHeaderText to empty string when bookletConfig is undefined', () => {
      service.bookletConfig = undefined as unknown as Record<string, unknown>;
      service.setHeaderText('Test Page');
      expect(service.screenHeaderText).toBe('');
    });
  });

  describe('updateCommentsUnitInfo', () => {
    it('should fetch and update comments for given unit', done => {
      const mockComments: Comment[] = [
        {
          id: 1,
          unitId: 100,
          userId: 1,
          userName: 'Test User',
          body: 'Test comment',
          itemUuids: [],
          hidden: false,
          parentId: null,
          createdAt: new Date(),
          changedAt: new Date()
        }
      ];
      service.reviewId = 123;
      mockBackendService.getUnitComments.mockReturnValue(of(mockComments));

      service.updateCommentsUnitInfo(100);

      setTimeout(() => {
        expect(mockBackendService.getUnitComments).toHaveBeenCalledWith(123, 100);
        expect(service.allComments).toEqual(mockComments);
        done();
      }, 100);
    });

    it('should handle empty comments array', done => {
      service.reviewId = 456;
      mockBackendService.getUnitComments.mockReturnValue(of([]));

      service.updateCommentsUnitInfo(200);

      setTimeout(() => {
        expect(mockBackendService.getUnitComments).toHaveBeenCalledWith(456, 200);
        expect(service.allComments).toEqual([]);
        done();
      }, 100);
    });

    it('should update allComments with new data on subsequent calls', done => {
      const firstComments: Comment[] = [
        {
          id: 1,
          unitId: 100,
          userId: 1,
          userName: 'User 1',
          body: 'Comment 1',
          itemUuids: [],
          hidden: false,
          parentId: null,
          createdAt: new Date(),
          changedAt: new Date()
        }
      ];
      const secondComments: Comment[] = [
        {
          id: 2,
          unitId: 200,
          userId: 2,
          userName: 'User 2',
          body: 'Comment 2',
          itemUuids: [],
          hidden: false,
          parentId: null,
          createdAt: new Date(),
          changedAt: new Date()
        }
      ];

      service.reviewId = 789;
      mockBackendService.getUnitComments.mockReturnValueOnce(of(firstComments));
      service.updateCommentsUnitInfo(100);

      setTimeout(() => {
        expect(service.allComments).toEqual(firstComments);

        mockBackendService.getUnitComments.mockReturnValueOnce(of(secondComments));
        service.updateCommentsUnitInfo(200);

        setTimeout(() => {
          expect(service.allComments).toEqual(secondComments);
          done();
        }, 100);
      }, 100);
    });
  });

  describe('toDateTimeString', () => {
    it('should format date using DatePipe with i18n settings', () => {
      const testDate = new Date('2024-01-15T10:30:00');
      const result = service.toDateTimeString(testDate);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should throw when date is invalid', () => {
      const testDate = new Date('invalid-date');
      expect(() => service.toDateTimeString(testDate)).toThrow();
    });

    it('should use i18nService locale and format', () => {
      expect(mockI18nService.fullLocale).toBe('en-US');
      expect(mockI18nService.dateTimeFormat).toBe('short');
    });
  });

  describe('loadReviewData', () => {
    it('should load review data and set page title', done => {
      const mockReviewData = {
        id: 456,
        name: 'Test Review',
        workspaceName: 'Test Workspace',
        workspaceGroupName: 'Test Group',
        workspaceId: 123,
        createdAt: new Date('2024-01-01'),
        changedAt: new Date('2024-01-02'),
        units: [1, 2, 3],
        settings: {
          reviewConfig: { canComment: true },
          bookletConfig: { unitScreenHeader: 'WITH_UNIT_TITLE' }
        }
      };

      service.reviewId = 456;
      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(mockBackendService.getReview).toHaveBeenCalledWith(456);
        expect(mockAppService.appConfig.setPageTitle).toHaveBeenCalledWith('Review Header', true);
        expect(service.reviewName).toBe('Test Review');
        expect(service.workspaceName).toBe('Test Workspace - Test Group');
        expect(service.workspaceId).toBe(123);
        expect(service.units).toHaveLength(3);
        expect(service.units[0].databaseId).toBe(1);
        expect(service.units[0].sequenceId).toBe(0);
        expect(service.units[0].name).toBe('Unit 1');
        expect(service.reviewConfig).toEqual({ canComment: true });
        expect(service.bookletConfig).toEqual({ unitScreenHeader: 'WITH_UNIT_TITLE' });
        expect(mockModuleService.loadList).toHaveBeenCalled();
        done();
      });
    });

    it('should handle missing review name', done => {
      const mockReviewData = {
        id: 1,
        workspaceId: 123,
        units: []
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.reviewName).toBe('?');
        done();
      });
    });

    it('should handle missing workspace information', done => {
      const mockReviewData = {
        id: 1,
        name: 'Test Review',
        units: []
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.workspaceName).toBe('');
        expect(service.workspaceId).toBe(0);
        done();
      });
    });

    it('should handle missing units array', done => {
      const mockReviewData = {
        id: 1,
        name: 'Test Review'
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.units).toEqual([]);
        done();
      });
    });

    it('should handle missing settings', done => {
      const mockReviewData = {
        id: 1,
        name: 'Test Review',
        units: []
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.reviewConfig).toEqual({});
        expect(service.bookletConfig).toEqual({});
        done();
      });
    });

    it('should clear units array before loading new data', done => {
      service.units = [
        {
          databaseId: 999, sequenceId: 0, playerId: 'old', responses: {}, definition: 'old', name: 'Old Unit'
        }
      ];

      const mockReviewData = {
        id: 1,
        name: 'Test Review',
        units: [1, 2]
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.units).toHaveLength(2);
        expect(service.units[0].databaseId).toBe(1);
        expect(service.units[1].databaseId).toBe(2);
        done();
      });
    });

    it('should create unit names with translated indices', done => {
      const mockReviewData = {
        id: 1,
        name: 'Test Review',
        units: [10, 20, 30]
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.units[0].name).toBe('Unit 1');
        expect(service.units[1].name).toBe('Unit 2');
        expect(service.units[2].name).toBe('Unit 3');
        expect(mockTranslateService.instant).toHaveBeenCalledWith('review.unit', { index: 1 });
        expect(mockTranslateService.instant).toHaveBeenCalledWith('review.unit', { index: 2 });
        expect(mockTranslateService.instant).toHaveBeenCalledWith('review.unit', { index: 3 });
        done();
      });
    });

    it('should initialize unit properties correctly', done => {
      const mockReviewData = {
        id: 1,
        name: 'Test Review',
        units: [100]
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(() => {
        expect(service.units[0].definition).toBe('');
        expect(service.units[0].playerId).toBe('');
        expect(service.units[0].responses).toBe('');
        done();
      });
    });

    it('should handle null reviewData', done => {
      mockBackendService.getReview.mockReturnValue(of(null));

      service.loadReviewData().subscribe(() => {
        expect(mockAppService.appConfig.setPageTitle).toHaveBeenCalledWith('Review Header', true);
        expect(mockModuleService.loadList).toHaveBeenCalled();
        done();
      });
    });

    it('should return Observable<void>', done => {
      const mockReviewData = {
        id: 1,
        name: 'Test Review',
        units: []
      };

      mockBackendService.getReview.mockReturnValue(of(mockReviewData));

      service.loadReviewData().subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });
  });
});
