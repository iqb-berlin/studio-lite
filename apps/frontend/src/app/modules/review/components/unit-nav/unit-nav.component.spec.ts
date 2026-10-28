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
});
