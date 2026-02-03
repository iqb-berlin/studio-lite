import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { UnitPlayerComponent } from './unit-player.component';
import { ReviewService } from '../../services/review.service';
import { ReviewBackendService } from '../../services/review-backend.service';
import { AppService } from '../../../../services/app.service';
import { ModuleService } from '../../../shared/services/module.service';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { UnitData } from '../../models/unit-data.class';

describe('UnitPlayerComponent', () => {
  let component: UnitPlayerComponent;
  let fixture: ComponentFixture<UnitPlayerComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockReviewBackendService: jest.Mocked<ReviewBackendService>;
  let mockAppService: jest.Mocked<AppService>;
  let mockModuleService: jest.Mocked<ModuleService>;
  let mockWorkspaceBackendService: jest.Mocked<WorkspaceBackendService>;
  let mockWorkspaceService: jest.Mocked<WorkspaceService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let paramsSubject: Subject<{ u: string }>;

  const mockUnitData: UnitData = {
    databaseId: 1,
    sequenceId: 0,
    playerId: 'player-1',
    responses: {},
    definition: 'test definition',
    name: 'Test Unit'
  };

  beforeEach(async () => {
    paramsSubject = new Subject<{ u: string }>();

    mockReviewService = {
      units: [mockUnitData],
      currentUnitSequenceId: 0,
      reviewId: 123,
      loadReviewData: jest.fn().mockReturnValue(of(undefined)),
      setHeaderText: jest.fn(),
      setUnitNavigationRequest: jest.fn(),
      bookletConfig: { pagingMode: 'separate' },
      reviewConfig: {
        showMetadata: false,
        showCoding: false,
        showOthersComments: false
      }
    } as unknown as jest.Mocked<ReviewService>;

    mockReviewBackendService = {
      getUnitProperties: jest.fn().mockReturnValue(of({
        key: 'unit-1',
        name: 'Test Unit',
        player: 'player-1'
      })),
      getUnitDefinition: jest.fn().mockReturnValue(of({
        definition: 'test definition'
      }))
    } as unknown as jest.Mocked<ReviewBackendService>;

    mockAppService = {
      authData: { userId: 1 },
      postMessage$: new Subject()
    } as unknown as jest.Mocked<AppService>;

    mockModuleService = {
      players: { 'player-1': {} }
    } as unknown as jest.Mocked<ModuleService>;

    mockWorkspaceBackendService = {
      getDirectDownloadLink: jest.fn().mockReturnValue('http://test.com/download')
    } as unknown as jest.Mocked<WorkspaceBackendService>;

    mockWorkspaceService = {} as unknown as jest.Mocked<WorkspaceService>;

    mockTranslateService = {
      instant: jest.fn((key: string) => key)
    } as unknown as jest.Mocked<TranslateService>;

    mockSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    mockActivatedRoute = {
      params: paramsSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [
        UnitPlayerComponent,
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ReviewService, useValue: mockReviewService },
        { provide: ReviewBackendService, useValue: mockReviewBackendService },
        { provide: AppService, useValue: mockAppService },
        { provide: ModuleService, useValue: mockModuleService },
        { provide: WorkspaceBackendService, useValue: mockWorkspaceBackendService },
        { provide: WorkspaceService, useValue: mockWorkspaceService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize unitData with default values', () => {
      expect(component.unitData).toBeDefined();
      expect(component.unitData.databaseId).toBe(0);
      expect(component.unitData.sequenceId).toBe(0);
    });

    it('should have all required services injected', () => {
      const route = (component as unknown as { route: ActivatedRoute }).route;
      expect(route).toBeDefined();
      expect(component.snackBar).toBeDefined();
      expect(component.backendService).toBeDefined();
      expect(component.reviewService).toBeDefined();
    });
  });

  describe('gotoUnit()', () => {
    beforeEach(() => {
      mockReviewService.currentUnitSequenceId = 5;
      mockReviewService.units = Array.from({ length: 10 }, (_, i) => ({
        databaseId: i + 1,
        sequenceId: i,
        playerId: `player-${i}`,
        responses: {},
        definition: `def-${i}`,
        name: `Unit ${i + 1}`
      }));
    });

    it('should navigate to next unit', () => {
      component.gotoUnit('next');

      expect(mockReviewService.setUnitNavigationRequest).toHaveBeenCalledWith(6);
    });

    it('should navigate to previous unit', () => {
      component.gotoUnit('previous');

      expect(mockReviewService.setUnitNavigationRequest).toHaveBeenCalledWith(4);
    });

    it('should navigate to first unit', () => {
      component.gotoUnit('first');

      expect(mockReviewService.setUnitNavigationRequest).toHaveBeenCalledWith(-1);
    });

    it('should navigate to last unit', () => {
      component.gotoUnit('last');

      expect(mockReviewService.setUnitNavigationRequest).toHaveBeenCalledWith(10);
    });

    it('should navigate to end page', () => {
      component.gotoUnit('end');

      expect(mockReviewService.setUnitNavigationRequest).toHaveBeenCalledWith(10);
    });

    it('should show snackbar for unknown navigation target', () => {
      component.gotoUnit('unknown');

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'workspace.player-send-unit-navigation-request',
        '',
        { duration: 3000 }
      );
    });
  });

  describe('handleUnitStateData()', () => {
    it('should update unitData responses when dataParts are provided', () => {
      const testResponses = { answer1: 'test', answer2: 'data' };
      const unitState = { dataParts: testResponses };

      const handleMethod = (component as unknown as {
        handleUnitStateData: (state: { dataParts?: Record<string, unknown> }) => void
      }).handleUnitStateData;
      handleMethod.call(component, unitState);

      expect(component.unitData.responses).toEqual(testResponses);
    });

    it('should not update responses when dataParts is undefined', () => {
      const initialResponses = { existing: 'data' };
      component.unitData.responses = initialResponses;
      const unitState = {};

      const handleMethod = (component as unknown as {
        handleUnitStateData: (state: { dataParts?: Record<string, unknown> }) => void
      }).handleUnitStateData;
      handleMethod.call(component, unitState);

      expect(component.unitData.responses).toEqual(initialResponses);
    });

    it('should handle empty dataParts object', () => {
      const unitState = { dataParts: {} };

      const handleMethod = (component as unknown as {
        handleUnitStateData: (state: { dataParts?: Record<string, unknown> }) => void
      }).handleUnitStateData;
      handleMethod.call(component, unitState);

      expect(component.unitData.responses).toEqual({});
    });
  });

  describe('postStore()', () => {
    beforeEach(() => {
      const componentWithPrivates = component as unknown as {
        postMessageTarget: Window | undefined;
        sessionId: string;
        playerApiVersion: number;
      };
      componentWithPrivates.postMessageTarget = {
        postMessage: jest.fn()
      } as unknown as Window;
      componentWithPrivates.sessionId = 'test-session';
    });

    it('should not post message when postMessageTarget is not set', () => {
      const componentWithPrivates = component as unknown as {
        postMessageTarget: Window | undefined;
      };
      componentWithPrivates.postMessageTarget = undefined;
      const postMessageSpy = jest.fn();

      component.postStore('test definition');

      expect(postMessageSpy).not.toHaveBeenCalled();
    });

    it('should post message with API version 1 format', () => {
      const componentWithPrivates = component as unknown as {
        postMessageTarget: Window | undefined;
        playerApiVersion: number;
      };
      componentWithPrivates.playerApiVersion = 1;
      const postMessageSpy = jest.spyOn(componentWithPrivates.postMessageTarget!, 'postMessage');

      component.postStore('test definition');

      expect(postMessageSpy).toHaveBeenCalledWith(
        {
          type: 'vo.ToPlayer.DataTransfer',
          sessionId: 'test-session',
          unitDefinition: 'test definition'
        },
        '*'
      );
    });

    it('should post message with API version 2+ format', () => {
      const componentWithPrivates = component as unknown as {
        postMessageTarget: Window | undefined;
        playerApiVersion: number;
      };
      componentWithPrivates.playerApiVersion = 2;
      component.unitData.responses = { test: 'data' };
      const postMessageSpy = jest.spyOn(componentWithPrivates.postMessageTarget!, 'postMessage');

      component.postStore('test definition');

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'vopStartCommand',
          sessionId: 'test-session',
          unitDefinition: 'test definition'
        }),
        '*'
      );
    });

    it('should handle empty definition string', () => {
      const componentWithPrivates = component as unknown as {
        postMessageTarget: Window | undefined;
        playerApiVersion: number;
      };
      componentWithPrivates.playerApiVersion = 1;
      const postMessageSpy = jest.spyOn(componentWithPrivates.postMessageTarget!, 'postMessage');

      component.postStore('');

      expect(postMessageSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          unitDefinition: ''
        }),
        '*'
      );
    });
  });

  describe('Component Properties', () => {
    it('should have unitData property', () => {
      expect(component.unitData).toBeDefined();
    });

    it('should have hostingIframe ViewChild reference', () => {
      expect(component.hostingIframe).toBeDefined();
    });
  });

  describe('Service Dependencies', () => {
    it('should inject ActivatedRoute', () => {
      const route = (component as unknown as { route: ActivatedRoute }).route;
      expect(route).toBeDefined();
    });

    it('should inject MatSnackBar', () => {
      expect(component.snackBar).toBeDefined();
    });

    it('should inject WorkspaceBackendService', () => {
      expect(component.backendService).toBeDefined();
    });

    it('should inject ReviewBackendService', () => {
      const reviewBackendService = (component as unknown as {
        reviewBackendService: ReviewBackendService
      }).reviewBackendService;
      expect(reviewBackendService).toBeDefined();
    });

    it('should inject ReviewService', () => {
      expect(component.reviewService).toBeDefined();
    });

    it('should inject TranslateService', () => {
      expect(component.translateService).toBeDefined();
    });
  });
});
