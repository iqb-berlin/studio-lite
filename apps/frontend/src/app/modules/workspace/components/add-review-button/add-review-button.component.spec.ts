import {
  ComponentFixture, TestBed, fakeAsync, flushMicrotasks
} from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';
import { AddReviewButtonComponent } from './add-review-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';

describe('AddReviewButtonComponent', () => {
  let component: AddReviewButtonComponent;
  let fixture: ComponentFixture<AddReviewButtonComponent>;

  let dialog: { open: jest.Mock<{ afterClosed: () => Observable<string | boolean> }> };
  let backendService: {
    addReview: jest.Mock<Observable<number | boolean>, [number, { workspaceId: number; name: string }]>
  };
  let snackBar: { open: jest.Mock<void, [string, string, { duration: number }]> };
  let translateService: TranslateService;

  beforeEach(async () => {
    dialog = { open: jest.fn(() => ({ afterClosed: () => of('Review 1') })) };
    backendService = {
      addReview: jest.fn<Observable<number | boolean>, [number, { workspaceId: number; name: string }]>(
        () => of(101)
      )
    };
    snackBar = { open: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        AddReviewButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    fixture = TestBed.createComponent(AddReviewButtonComponent);
    component = fixture.componentInstance;
    component.workspaceId = 42;
    component.changed = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates a review when confirmed', fakeAsync(() => {
    const addedSpy = jest.fn();
    const changedSpy = jest.fn();
    component.added.subscribe(addedSpy);
    component.changedChange.subscribe(changedSpy);

    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);

    component.addReview();
    flushMicrotasks();

    expect(backendService.addReview).toHaveBeenCalledWith(42, {
      workspaceId: 42,
      name: 'Review 1'
    });
    expect(addedSpy).toHaveBeenCalledWith(101);
    expect(changedSpy).toHaveBeenCalledWith(false);
  }));

  it('does not continue when change guard rejects', fakeAsync(() => {
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(false);

    component.addReview();
    flushMicrotasks();

    expect(dialog.open).not.toHaveBeenCalled();
    expect(backendService.addReview).not.toHaveBeenCalled();
  }));

  it('shows a snackbar when the backend rejects creation', fakeAsync(() => {
    backendService.addReview.mockReturnValueOnce(of(false));
    jest.spyOn(component, 'checkForChangesAndContinue').mockResolvedValue(true);

    component.addReview();
    flushMicrotasks();

    expect(snackBar.open).toHaveBeenCalledWith('workspace.review-not-added', '', { duration: 3000 });
  }));
});
