import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { UnitItemDto } from '@studio-lite-lib/api-dto';
import { environment } from '../../../../../environments/environment';
import { CommentDialogComponent } from './comment-dialog.component';
import { ReviewBackendService } from '../../services/review-backend.service';
import { ReviewService } from '../../services/review.service';
import { AppService } from '../../../../services/app.service';

describe('CommentDialogComponent', () => {
  let component: CommentDialogComponent;
  let fixture: ComponentFixture<CommentDialogComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<CommentDialogComponent>>;
  let mockBackendService: jest.Mocked<ReviewBackendService>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockAppService: jest.Mocked<AppService>;

  const mockUnitItems: UnitItemDto[] = [
    { id: 'item2' },
    { id: 'item1' },
    { id: 'item3' }
  ];

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    } as unknown as jest.Mocked<MatDialogRef<CommentDialogComponent>>;

    mockBackendService = {
      getUnitItems: jest.fn().mockReturnValue(of(mockUnitItems))
    } as unknown as jest.Mocked<ReviewBackendService>;

    mockReviewService = {
      reviewId: 123,
      unitDbId: 456,
      reviewConfig: { showOthersComments: false }
    } as unknown as jest.Mocked<ReviewService>;

    mockAppService = {
      authData: {
        userId: 0,
        userName: '',
        userLongName: ''
      }
    } as unknown as jest.Mocked<AppService>;

    await TestBed.configureTestingModule({
      imports: [
        CommentDialogComponent,
        TranslateModule.forRoot(),
        FormsModule,
        MatInputModule,
        MatDialogModule
      ],
      providers: [
        provideHttpClient(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ReviewBackendService, useValue: mockBackendService },
        { provide: ReviewService, useValue: mockReviewService },
        { provide: AppService, useValue: mockAppService },
        { provide: 'SERVER_URL', useValue: environment.backendUrl }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('where the focus goes (#1785)', () => {
    it('should keep the focus out of the editor for an external visitor without a kept name', () => {
      component.ngOnInit();

      expect(component.focusEditor).toBe(false);
    });

    it('should let the editor take the focus when the name was kept from before', () => {
      localStorage.setItem('iqb-studio-user-name-for-review-comments', 'John Doe');

      component.ngOnInit();

      expect(component.focusEditor).toBe(true);
    });

    it('should let the editor take the focus for a logged-in user', () => {
      mockAppService.authData.userId = 1;
      mockAppService.authData.userName = 'jsmith';

      component.ngOnInit();

      expect(component.focusEditor).toBe(true);
    });

    it('should keep the focus out of the editor once a kept name is edited', () => {
      localStorage.setItem('iqb-studio-user-name-for-review-comments', 'John Doe');
      component.ngOnInit();

      // Cleared and typed anew: the editor disappears and appears again with the first letter
      component.userName = '';
      component.storeUserName();
      component.userName = 'J';
      component.storeUserName();

      expect(component.focusEditor).toBe(false);
    });

    it('should put the focus into the name field when the name is missing', () => {
      fixture.detectChanges();
      // Runs the application's render hooks, afterNextRender among them
      TestBed.tick();

      expect(component.nameInput).toBeDefined();
      expect(document.activeElement).toBe(component.nameInput?.nativeElement);
    });

    it('should leave the name field unfocused when the editor takes the focus', () => {
      const nameField = document.createElement('input');
      const focus = jest.spyOn(nameField, 'focus');
      component.nameInput = new ElementRef(nameField);
      component.focusEditor = true;

      component.focusNameIfMissing();

      expect(focus).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit()', () => {
    it('should initialize userName from localStorage when userId is 0', () => {
      const storedName = 'John Doe';
      localStorage.setItem('iqb-studio-user-name-for-review-comments', storedName);
      mockAppService.authData.userId = 0;

      component.ngOnInit();

      expect(component.userName).toBe(storedName);
    });

    it('should initialize userName to empty string when localStorage is empty and userId is 0', () => {
      mockAppService.authData.userId = 0;

      component.ngOnInit();

      expect(component.userName).toBe('');
    });

    it('should initialize userName from authData.userLongName when userId is not 0', () => {
      mockAppService.authData.userId = 1;
      mockAppService.authData.userLongName = 'Jane Smith';

      component.ngOnInit();

      expect(component.userName).toBe('Jane Smith');
    });

    it('should initialize userName from authData.userName when userLongName is not available', () => {
      mockAppService.authData.userId = 1;
      mockAppService.authData.userLongName = '';
      mockAppService.authData.userName = 'jsmith';

      component.ngOnInit();

      expect(component.userName).toBe('jsmith');
    });

    it('should load unit items from backend', () => {
      component.ngOnInit();

      expect(mockBackendService.getUnitItems).toHaveBeenCalledWith(123, 456);
    });

    it('should sort unit items by id in ascending order', done => {
      component.ngOnInit();

      setTimeout(() => {
        expect(component.unitItems.length).toBe(3);
        expect(component.unitItems[0].id).toBe('item1');
        expect(component.unitItems[1].id).toBe('item2');
        expect(component.unitItems[2].id).toBe('item3');
        done();
      }, 10);
    });

    it('should handle empty unit items response', done => {
      mockBackendService.getUnitItems.mockReturnValue(of([]));

      component.ngOnInit();

      setTimeout(() => {
        expect(component.unitItems).toEqual([]);
        done();
      }, 10);
    });
  });

  describe('close()', () => {
    it('should close dialog when showOthersComments is false', () => {
      mockReviewService.reviewConfig.showOthersComments = false;

      component.close();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not close dialog when showOthersComments is true', () => {
      mockReviewService.reviewConfig.showOthersComments = true;

      component.close();

      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('storeUserName()', () => {
    it('should store userName in localStorage', () => {
      component.userName = 'Test User';

      component.storeUserName();

      const stored = localStorage.getItem('iqb-studio-user-name-for-review-comments');
      expect(stored).toBe('Test User');
    });

    it('should overwrite existing userName in localStorage', () => {
      localStorage.setItem('iqb-studio-user-name-for-review-comments', 'Old Name');
      component.userName = 'New Name';

      component.storeUserName();

      const stored = localStorage.getItem('iqb-studio-user-name-for-review-comments');
      expect(stored).toBe('New Name');
    });

    it('should handle empty userName', () => {
      component.userName = '';

      component.storeUserName();

      const stored = localStorage.getItem('iqb-studio-user-name-for-review-comments');
      expect(stored).toBe('');
    });
  });

  describe('ngOnDestroy()', () => {
    it('should complete ngUnsubscribe subject', () => {
      const ngUnsubscribe = (component as unknown as { ngUnsubscribe: Subject<void> }).ngUnsubscribe;
      const nextSpy = jest.spyOn(ngUnsubscribe, 'next');
      const completeSpy = jest.spyOn(ngUnsubscribe, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from all observables', () => {
      component.ngOnInit();
      const ngUnsubscribe = (component as unknown as { ngUnsubscribe: Subject<void> }).ngUnsubscribe;
      const completeSpy = jest.spyOn(ngUnsubscribe, 'complete');

      component.ngOnDestroy();

      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Component Properties', () => {
    it('should initialize with empty userName', () => {
      expect(component.userName).toBe('');
    });

    it('should initialize with empty unitItems array', () => {
      expect(component.unitItems).toEqual([]);
    });

    it('should have reviewService accessible', () => {
      expect(component.reviewService).toBeDefined();
    });

    it('should have appService accessible', () => {
      expect(component.appService).toBeDefined();
    });

    it('should have dialogRef accessible', () => {
      expect(component.dialogRef).toBeDefined();
    });
  });
});
