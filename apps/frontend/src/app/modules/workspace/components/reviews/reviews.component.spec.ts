// eslint-disable-next-line max-classes-per-file
import {
  ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  BookletConfigDto, ReviewConfigDto, ReviewFullDto, ReviewInListDto
} from '@studio-lite-lib/api-dto';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { ReviewsComponent } from './reviews.component';
import { environment } from '../../../../../environments/environment';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { WorkspaceService } from '../../services/workspace.service';
import { AppService } from '../../../../services/app.service';
import { I18nService } from '../../../../services/i18n.service';

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;

  @Component({ selector: 'studio-lite-review-menu', template: '', standalone: false })
  class MockReviewMenuComponent {
    @Input() selectedReviewId!: number;
    @Input() changed!: boolean;
    @Input() units!: number[];
    @Input() workspaceId!: number;
    @Input() workspaceGroupId!: number;
    @Input() link!: string;
    @Input() passwordLength!: number;
    @Input() bookletConfigSettings!: BookletConfigDto | undefined;
  }

  @Component({ selector: 'studio-lite-select-unit-list', template: '', standalone: false })
  class MockSelectUnitListComponent {
    @Input() filter!: number[];
    @Input() initialSelection!: number[];
    @Input() selectedUnitIds!: number[];
    @Input() workspace!: number;
    @Input() disabled!: number[];
    @Input() selectionCount!: number;
    @Input() selectedUnitId!: number;
  }

  @Component({ selector: 'studio-lite-review-config', template: '', standalone: false })
  class MockReviewConfigComponent {
    @Input() selectedReviewId!: number;
    @Input() name!: string | undefined;
    @Input() password!: string | undefined;
    @Input() bookletConfigSettings!: BookletConfigDto | undefined;
    @Input() reviewConfigSettings!: ReviewConfigDto | undefined;
  }

  @Component({ selector: 'studio-lite-search-filter', template: '', standalone: false })
  class MockSearchFilterComponent {
    @Input() title!: string;
  }

  @Component({ selector: 'studio-lite-save-changes', template: '', standalone: false })
  class MockSaveChangesComponent {
    @Input() changed!: boolean;
  }

  let backendServiceMock: jest.Mocked<WorkspaceBackendService>;
  let workspaceServiceMock: WorkspaceService;
  let appServiceMock: AppService;
  let i18nServiceMock: I18nService;
  let snackBarMock: MatSnackBar;
  let dialogMock: MatDialog;

  const createReviewFull = (overrides: Partial<ReviewFullDto> = {}): ReviewFullDto => ({
    id: 1,
    name: 'Review A',
    password: 'pw',
    link: 'link',
    settings: {
      bookletConfig: {},
      reviewConfig: {}
    },
    units: [11, 12],
    ...overrides
  });

  const createReviewList = (): ReviewInListDto[] => ([
    {
      id: 1,
      name: 'Review A',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      changedAt: new Date('2023-01-02T00:00:00Z')
    },
    {
      id: 2,
      name: 'Review B',
      createdAt: new Date('2023-01-03T00:00:00Z'),
      changedAt: new Date('2023-01-04T00:00:00Z')
    }
  ]);

  beforeEach(async () => {
    backendServiceMock = {
      getReviewList: jest.fn().mockReturnValue(of([])),
      getReview: jest.fn().mockReturnValue(of(createReviewFull())),
      setReview: jest.fn().mockReturnValue(of(true))
    } as unknown as jest.Mocked<WorkspaceBackendService>;

    workspaceServiceMock = {
      selectedWorkspaceId: 7,
      groupId: 3
    } as WorkspaceService;

    appServiceMock = {
      dataLoading: false
    } as AppService;

    i18nServiceMock = {
      dateTimeFormat: 'dd.MM.yyyy HH:mm',
      timeZone: 'UTC'
    } as I18nService;

    snackBarMock = {
      open: jest.fn()
    } as unknown as MatSnackBar;

    dialogMock = {
      open: jest.fn().mockReturnValue({
        afterClosed: () => of(true)
      })
    } as unknown as MatDialog;

    await TestBed.configureTestingModule({
      declarations: [
        MockReviewMenuComponent,
        MockSelectUnitListComponent,
        MockReviewConfigComponent,
        MockSaveChangesComponent,
        MockSearchFilterComponent
      ],
      imports: [
        MatTableModule,
        MatSortModule,
        MatDialogModule,
        MatSnackBarModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        },
        {
          provide: WorkspaceBackendService,
          useValue: backendServiceMock
        },
        {
          provide: WorkspaceService,
          useValue: workspaceServiceMock
        },
        {
          provide: AppService,
          useValue: appServiceMock
        },
        {
          provide: I18nService,
          useValue: i18nServiceMock
        },
        {
          provide: MatSnackBar,
          useValue: snackBarMock
        },
        {
          provide: MatDialog,
          useValue: dialogMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ReviewsComponent, {
        set: {
          template: ''
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should select a review and copy data when confirmed', fakeAsync(() => {
    const review = createReviewFull();
    backendServiceMock.getReview.mockReturnValue(of(review));
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);

    component.changed = true;
    component.selectReview(1);
    flushMicrotasks();

    expect(backendServiceMock.getReview).toHaveBeenCalledWith(7, 1);
    expect(component.selectedReviewId).toBe(1);
    expect(component.reviewDataOriginal).toEqual(review);
    expect(component.reviewDataToChange).toEqual(review);
    expect(component.changed).toBe(false);
  }));

  it('should reset data when selecting id 0', fakeAsync(() => {
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull({ id: 2, name: 'Other' });

    component.selectReview(0);
    flushMicrotasks();

    expect(component.selectedReviewId).toBe(0);
    expect(component.reviewDataOriginal).toEqual({ id: 0 });
    expect(component.reviewDataToChange).toEqual({ id: 0 });
  }));

  describe('while the selected review loads', () => {
    let reviewA: Subject<ReviewFullDto | null>;
    let reviewB: Subject<ReviewFullDto | null>;

    beforeEach(() => {
      reviewA = new Subject<ReviewFullDto | null>();
      reviewB = new Subject<ReviewFullDto | null>();
      backendServiceMock.getReview
        .mockImplementation((wsId: number, reviewId: number) => (reviewId === 1 ? reviewA : reviewB));
      jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);
    });

    it('should be locked until the review has arrived', fakeAsync(() => {
      component.selectReview(1);
      flushMicrotasks();

      expect(component.isLoadingReview).toBe(true);

      reviewA.next(createReviewFull());

      expect(component.isLoadingReview).toBe(false);
      expect(component.reviewDataToChange.name).toBe('Review A');
    }));

    it('should give the review menu nothing of the review selected before while another one loads', fakeAsync(() => {
      component.selectReview(1);
      flushMicrotasks();
      reviewA.next(createReviewFull());
      component.selectReview(2);
      flushMicrotasks();

      expect(component.reviewDataOriginal).toEqual({ id: 0 });

      const answerB = createReviewFull({ id: 2, name: 'Review B', link: 'link-b' });
      reviewB.next(answerB);

      expect(component.reviewDataOriginal).toEqual(answerB);
    }));

    it('should drop the late review selected before', fakeAsync(() => {
      component.selectReview(1);
      flushMicrotasks();
      component.selectReview(2);
      flushMicrotasks();

      expect(reviewA.observed).toBe(false);

      reviewB.next(createReviewFull({ id: 2, name: 'Review B', units: [13] }));

      expect(component.isLoadingReview).toBe(false);
      expect(component.reviewDataToChange.name).toBe('Review B');
      expect(component.reviewDataToChange.units).toEqual([13]);
    }));

    it('should not save the data of the review selected before onto the one still loading', fakeAsync(() => {
      component.selectReview(1);
      flushMicrotasks();
      reviewA.next(createReviewFull({ name: 'Old' }));
      component.reviewDataToChange.name = 'New';
      component.selectReview(2);
      flushMicrotasks();

      component.saveChanges();

      expect(backendServiceMock.setReview).not.toHaveBeenCalled();
    }));

    it('should select nothing when the review does not arrive', fakeAsync(() => {
      component.selectReview(1);
      flushMicrotasks();
      reviewA.next(createReviewFull());
      component.selectReview(2);
      flushMicrotasks();

      reviewB.next(null);

      expect(component.isLoadingReview).toBe(false);
      expect(component.selectedReviewId).toBe(0);
      expect(component.reviewDataOriginal).toEqual({ id: 0 });
      expect(component.reviewDataToChange).toEqual({ id: 0 });
    }));

    it('should stay locked when a review clicked during a reload of the list arrives first', fakeAsync(() => {
      const reviewList = new Subject<ReviewInListDto[]>();
      backendServiceMock.getReviewList.mockReturnValue(reviewList);
      component.loadReviewList(2);
      component.selectReview(1);
      flushMicrotasks();

      reviewA.next(createReviewFull());

      expect(component.isLoadingReview).toBe(true);

      reviewList.next(createReviewList());
      flushMicrotasks();
      reviewB.next(createReviewFull({ id: 2, name: 'Review B' }));
      tick();

      expect(component.isLoadingReview).toBe(false);
      expect(component.selectedReviewId).toBe(2);
    }));

    it('should unlock when no review is selected anymore', fakeAsync(() => {
      component.selectReview(1);
      flushMicrotasks();
      component.selectReview(0);
      flushMicrotasks();

      expect(component.isLoadingReview).toBe(false);
      expect(reviewA.observed).toBe(false);
    }));

    it('should be locked from the start of a reload of the list until the review has arrived', fakeAsync(() => {
      const reviewList = new Subject<ReviewInListDto[]>();
      backendServiceMock.getReviewList.mockReturnValue(reviewList);
      component.selectReview(1);
      flushMicrotasks();

      component.loadReviewList(2);

      expect(component.isLoadingReview).toBe(true);
      expect(reviewA.observed).toBe(false);

      reviewList.next(createReviewList());
      flushMicrotasks();

      expect(component.isLoadingReview).toBe(true);

      reviewB.next(createReviewFull({ id: 2, name: 'Review B' }));
      tick();

      expect(component.isLoadingReview).toBe(false);
      expect(component.selectedReviewId).toBe(2);
    }));
  });

  it('should discard changes and restore from original', () => {
    component.changed = true;
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull({ name: 'Changed', units: [99] });

    component.discardChanges();

    expect(component.changed).toBe(false);
    expect(component.reviewDataToChange).toEqual(component.reviewDataOriginal);
    expect(component.reviewDataToChange.units).not.toBe(component.reviewDataOriginal.units);
  });

  it('should save changes and keep list when name unchanged', () => {
    component.reviewDataOriginal = createReviewFull({ name: 'Same' });
    component.reviewDataToChange = createReviewFull({ name: 'Same' });
    component.selectedReviewId = 1;
    backendServiceMock.setReview.mockReturnValue(of(true));
    const loadSpy = jest.spyOn(component, 'loadReviewList');

    component.saveChanges();

    expect(backendServiceMock.setReview).toHaveBeenCalledWith(7, 1, component.reviewDataToChange);
    expect(loadSpy).not.toHaveBeenCalled();
    expect(component.changed).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalled();
  });

  // reloading the whole review would replace what was entered while the save was under way (#2094)
  it('should save changes and reload only the list when the name changes', () => {
    component.reviewDataOriginal = createReviewFull({ name: 'Old' });
    component.reviewDataToChange = createReviewFull({ name: 'New' });
    component.selectedReviewId = 1;
    backendServiceMock.setReview.mockReturnValue(of(true));
    backendServiceMock.getReviewList.mockReturnValue(of([{ id: 1, name: 'New' }]));
    const loadSpy = jest.spyOn(component, 'loadReviewList');

    component.saveChanges();

    expect(loadSpy).not.toHaveBeenCalled();
    expect(component.reviews).toEqual([{ id: 1, name: 'New' }]);
    expect(component.selectedReviewId).toBe(1);
    expect(component.reviewDataToChange.name).toBe('New');
    expect(component.changed).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalled();
  });

  // #2094: the list reloaded after a rename and a list load begun before it answer in either order
  it('keeps the list of the load begun last, whichever answers first', fakeAsync(() => {
    const begunFirst = new Subject<ReviewInListDto[]>();
    const begunLast = new Subject<ReviewInListDto[]>();
    backendServiceMock.getReviewList.mockReturnValueOnce(begunFirst).mockReturnValueOnce(begunLast);
    backendServiceMock.setReview.mockReturnValue(of(true));
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);
    component.loadReviewList(1);
    component.reviewDataOriginal = createReviewFull({ name: 'Old' });
    component.reviewDataToChange = createReviewFull({ name: 'New' });
    component.selectedReviewId = 1;
    component.isLoadingReview = false;

    component.saveChanges();
    begunLast.next([{ id: 1, name: 'New' }, { id: 2, name: 'Created' }]);
    begunFirst.next([{ id: 1, name: 'Old' }]);
    flushMicrotasks();
    tick();

    expect(component.reviews).toEqual([{ id: 1, name: 'New' }, { id: 2, name: 'Created' }]);
    expect(component.objectsDatasource.data).toEqual([{ id: 1, name: 'New' }, { id: 2, name: 'Created' }]);
  }));

  // #2094: what is entered while the save is under way was not sent, and a second save waits
  it('keeps an entry made while saving unsaved and does not save twice meanwhile', () => {
    const answer = new Subject<boolean>();
    backendServiceMock.setReview.mockReturnValue(answer);
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull({ password: 'gesendet' });
    component.selectedReviewId = 1;

    component.saveChanges();
    component.reviewDataToChange.password = 'danach';
    component.saveChanges();
    answer.next(true);

    expect(backendServiceMock.setReview).toHaveBeenCalledTimes(1);
    expect(backendServiceMock.setReview.mock.calls[0][2].password).toBe('gesendet');
    expect(component.reviewDataOriginal.password).toBe('gesendet');
    expect(component.changed).toBe(true);
  });

  // copyFrom fills in configs a review lacks: compared with that, every review without them was changed
  it('leaves nothing changed after a save without entries meanwhile, whatever configs the review has', () => {
    backendServiceMock.setReview.mockReturnValue(of(true));
    component.reviewDataOriginal = createReviewFull({ settings: { reviewConfig: {} } });
    component.reviewDataToChange = createReviewFull({ name: 'New', settings: { reviewConfig: {} } });
    component.selectedReviewId = 1;

    component.saveChanges();

    expect(component.changed).toBe(false);
  });

  // #2094: switched away and back while the save was under way, the review was loaded anew before the save had
  // arrived, and the answer took the save for that data: the form showed the old state as a change to save over it
  it('shows what is stored when a review was loaded anew while its save was under way', fakeAsync(() => {
    const answer = new Subject<boolean>();
    backendServiceMock.setReview.mockReturnValue(answer);
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);
    const loadsOfReviewA = [createReviewFull({ password: 'vorher' }), createReviewFull({ password: 'gesendet' })];
    backendServiceMock.getReview.mockImplementation((wsId: number, reviewId: number) => (
      of(reviewId === 1 ? loadsOfReviewA.shift() || null : createReviewFull({ id: 2, name: 'Review B' }))));
    component.reviewDataOriginal = createReviewFull({ password: 'vorher' });
    component.reviewDataToChange = createReviewFull({ password: 'gesendet' });
    component.selectedReviewId = 1;

    component.saveChanges();
    component.selectReview(2);
    flushMicrotasks();
    component.selectReview(1);
    flushMicrotasks();
    answer.next(true);
    flushMicrotasks();

    expect(component.reviewDataOriginal).toEqual(createReviewFull({ password: 'gesendet' }));
    expect(component.reviewDataToChange).toEqual(createReviewFull({ password: 'gesendet' }));
    expect(component.changed).toBe(false);
  }));

  // #2094: discarded while the save was under way, the form went back to the state before it, and the answer
  // took that for a change to save over what had just been stored
  it('shows what is stored when the changes were discarded while the save was under way', fakeAsync(() => {
    const answer = new Subject<boolean>();
    backendServiceMock.setReview.mockReturnValue(answer);
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);
    backendServiceMock.getReview.mockReturnValue(of(createReviewFull({ password: 'gesendet' })));
    component.reviewDataOriginal = createReviewFull({ password: 'vorher' });
    component.reviewDataToChange = createReviewFull({ password: 'gesendet' });
    component.selectedReviewId = 1;
    component.changed = true;

    component.saveChanges();
    component.discardChanges();
    answer.next(true);
    flushMicrotasks();

    expect(component.reviewDataToChange).toEqual(createReviewFull({ password: 'gesendet' }));
    expect(component.changed).toBe(false);
  }));

  it('leaves a review selected while the save of another one was under way alone', fakeAsync(() => {
    const answer = new Subject<boolean>();
    backendServiceMock.setReview.mockReturnValue(answer);
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);
    backendServiceMock.getReview.mockReturnValue(of(createReviewFull({ id: 2, name: 'Review B' })));
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull({ password: 'gesendet' });
    component.selectedReviewId = 1;

    component.saveChanges();
    component.selectReview(2);
    flushMicrotasks();
    answer.next(true);

    expect(component.reviewDataOriginal).toEqual(createReviewFull({ id: 2, name: 'Review B' }));
    expect(component.changed).toBe(false);
  }));

  it('should show error snackbar when save fails', () => {
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull();
    component.selectedReviewId = 1;
    backendServiceMock.setReview.mockReturnValue(of(false));

    component.saveChanges();

    expect(snackBarMock.open).toHaveBeenCalledWith('workspace.review-not-saved', 'workspace.error', expect.anything());
  });

  it('should detect no changes for identical data', () => {
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull();

    expect(component.detectChanges()).toBe(false);
  });

  it('should detect changes when name differs', () => {
    component.reviewDataOriginal = createReviewFull({ name: 'A' });
    component.reviewDataToChange = createReviewFull({ name: 'B' });

    expect(component.detectChanges()).toBe(true);
  });

  it('should update review config settings', () => {
    const reviewConfig: ReviewConfigDto = { showCoding: true };
    component.reviewDataToChange = createReviewFull({ settings: undefined });

    component.reviewConfigSettingsChange(reviewConfig);

    expect(component.reviewDataToChange.settings?.reviewConfig).toEqual(reviewConfig);
  });

  it('should update booklet config settings', () => {
    const bookletConfig: BookletConfigDto = { unitTitle: 'OFF' };
    component.reviewDataToChange = createReviewFull({ settings: undefined });

    component.bookletConfigSettingsChange(bookletConfig);

    expect(component.reviewDataToChange.settings?.bookletConfig).toEqual(bookletConfig);
  });

  it('should keep the selected review when its changes are not to be discarded', fakeAsync(() => {
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(false);
    component.selectedReviewId = 1;
    component.changed = true;

    component.selectReview(2);
    flushMicrotasks();

    expect(component.checkForChangesAndContinue).toHaveBeenCalledWith(true);
    expect(backendServiceMock.getReview).not.toHaveBeenCalled();
    expect(component.selectedReviewId).toBe(1);
    expect(component.changed).toBe(true);
  }));

  it.each<[string, Partial<ReviewFullDto>]>([
    ['password', { password: 'other' }],
    ['setting', { settings: { bookletConfig: { unitTitle: 'OFF' }, reviewConfig: {} } }]
  ])('should detect changes when the %s differs', (_, change) => {
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull(change);

    expect(component.detectChanges()).toBe(true);
  });

  it('should take another unit selection as a change and the original one as none', () => {
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull();

    component.unitSelectionChanged([11]);
    expect(component.changed).toBe(true);

    component.unitSelectionChanged([11, 12]);
    expect(component.changed).toBe(false);
  });

  it.each<[string, (reviews: ReviewsComponent) => void, ReviewFullDto['settings']]>([
    ['review config', reviews => reviews.reviewConfigSettingsChange({ showCoding: true }),
      { bookletConfig: { unitTitle: 'OFF' }, reviewConfig: { showCoding: true } }],
    ['booklet config', reviews => reviews.bookletConfigSettingsChange({ unitTitle: 'ON' }),
      { bookletConfig: { unitTitle: 'ON' }, reviewConfig: { showCoding: false } }]
  ])('should change only the %s of the settings', (_, change, settings) => {
    component.reviewDataToChange = createReviewFull({
      settings: { bookletConfig: { unitTitle: 'OFF' }, reviewConfig: { showCoding: false } }
    });

    change(component);

    expect(component.reviewDataToChange.settings).toEqual(settings);
  });

  it('should filter the reviews by any part of their name regardless of case', fakeAsync(() => {
    backendServiceMock.getReviewList.mockReturnValue(of([
      ...createReviewList(), { id: 3, name: 'Erste Probe' }
    ]));
    component.loadReviewList();
    flushMicrotasks();
    tick();

    component.objectsDatasource.filter = 'pro';

    expect(component.objectsDatasource.filteredData.map(review => review.name)).toEqual(['Erste Probe']);
  }));
});
