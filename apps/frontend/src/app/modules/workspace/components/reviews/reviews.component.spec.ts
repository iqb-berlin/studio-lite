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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
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
        NoopAnimationsModule,
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

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadReviewList on init', fakeAsync(() => {
    const loadSpy = jest.spyOn(component, 'loadReviewList').mockImplementation(() => undefined);

    component.ngOnInit();
    tick();

    expect(loadSpy).toHaveBeenCalled();
  }));

  it('should load reviews and initialize datasource', fakeAsync(() => {
    const reviews = createReviewList();
    backendServiceMock.getReviewList.mockReturnValue(of(reviews));
    const selectSpy = jest.spyOn(component, 'selectReview');

    component.loadReviewList();
    tick();
    tick();

    expect(appServiceMock.dataLoading).toBe(false);
    expect(component.reviews).toEqual(reviews);
    expect(selectSpy).toHaveBeenCalledWith(0);
    expect(component.objectsDatasource.data).toEqual(reviews);
  }));

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

  it('should update units and mark changes on unitSelectionChanged', () => {
    const detectSpy = jest.spyOn(component, 'detectChanges').mockReturnValue(true);

    component.reviewDataToChange = createReviewFull({ units: [] });
    component.unitSelectionChanged([3, 4]);

    expect(component.reviewDataToChange.units).toEqual([3, 4]);
    expect(detectSpy).toHaveBeenCalled();
    expect(component.changed).toBe(true);
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

  it('should save changes and reload list when name changes', () => {
    component.reviewDataOriginal = createReviewFull({ name: 'Old' });
    component.reviewDataToChange = createReviewFull({ name: 'New' });
    component.selectedReviewId = 1;
    backendServiceMock.setReview.mockReturnValue(of(true));
    const loadSpy = jest.spyOn(component, 'loadReviewList');

    component.saveChanges();

    expect(loadSpy).toHaveBeenCalledWith(1);
    expect(component.changed).toBe(false);
    expect(snackBarMock.open).toHaveBeenCalled();
  });

  it('should show error snackbar when save fails', () => {
    component.reviewDataOriginal = createReviewFull();
    component.reviewDataToChange = createReviewFull();
    component.selectedReviewId = 1;
    backendServiceMock.setReview.mockReturnValue(of(false));

    component.saveChanges();

    expect(snackBarMock.open).toHaveBeenCalled();
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
});
