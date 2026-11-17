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
import { BackendService } from '../../../../services/backend.service';

describe('StartComponent', () => {
  let component: StartComponent;
  let fixture: ComponentFixture<StartComponent>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockAppService: jest.Mocked<AppService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockBackendService: jest.Mocked<BackendService>;

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
      },
      clearErrorMessages: jest.fn()
    } as unknown as jest.Mocked<AppService>;

    mockBackendService = { logout: jest.fn() } as unknown as jest.Mocked<BackendService>;

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
        { provide: BackendService, useValue: mockBackendService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StartComponent);
    component = fixture.componentInstance;
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
  });

  describe('a refused review (#1818)', () => {
    const accessDeniedText = (): Element | null => fixture.nativeElement.querySelector('.access-denied');

    beforeEach(() => {
      Object.assign(mockReviewService, { bookletConfig: {}, reviewName: '', workspaceName: '' });
    });

    const logoutButton = (): HTMLButtonElement | null => fixture.nativeElement
      .querySelector('[data-cy="review-access-denied-logout"]');

    it('should tell the user to use the review link, and offer the logout for it (#2156)', () => {
      mockReviewService.accessDenied = true;
      fixture.detectChanges();

      expect(accessDeniedText()).not.toBeNull();
      expect(logoutButton()).not.toBeNull();
    });

    it('should say nothing of it for a review that loaded', () => {
      mockReviewService.accessDenied = false;
      fixture.detectChanges();

      expect(accessDeniedText()).toBeNull();
      expect(logoutButton()).toBeNull();
    });

    it('should log out from its button', () => {
      mockReviewService.accessDenied = true;
      fixture.detectChanges();

      logoutButton()?.click();

      expect(mockBackendService.logout).toHaveBeenCalled();
    });
  });
});
