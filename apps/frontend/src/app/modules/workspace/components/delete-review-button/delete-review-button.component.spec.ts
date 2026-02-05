import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { DeleteReviewButtonComponent } from './delete-review-button.component';
import { WorkspaceBackendService } from '../../services/workspace-backend.service';
import { AppService } from '../../../../services/app.service';

describe('DeleteReviewButtonComponent', () => {
  let component: DeleteReviewButtonComponent;
  let fixture: ComponentFixture<DeleteReviewButtonComponent>;

  let dialog: { open: jest.Mock<{ afterClosed: () => Observable<boolean> }> };
  let backendService: {
    deleteReview: jest.Mock<Observable<boolean>, [number, number]>;
  };
  let snackBar: { open: jest.Mock<void, [string, string, { duration: number }]> };
  let translateService: TranslateService;
  let appService: { dataLoading: boolean };

  beforeEach(async () => {
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(true) })) };
    backendService = {
      deleteReview: jest.fn<Observable<boolean>, [number, number]>(() => of(true))
    };
    snackBar = { open: jest.fn() };
    appService = { dataLoading: false };

    await TestBed.configureTestingModule({
      imports: [
        DeleteReviewButtonComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })
      ],
      providers: [
        { provide: MatDialog, useValue: dialog },
        { provide: WorkspaceBackendService, useValue: backendService },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: AppService, useValue: appService }
      ]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => (
      Array.isArray(key) ? key.join(',') : key
    ));

    fixture = TestBed.createComponent(DeleteReviewButtonComponent);
    component = fixture.componentInstance;
    component.workspaceId = 7;
    component.selectedReviewId = 3;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deletes a review after confirmation', () => {
    const deletedSpy = jest.fn();
    const changedSpy = jest.fn();
    component.deleted.subscribe(deletedSpy);
    component.changedChange.subscribe(changedSpy);

    component.deleteReview();

    expect(dialog.open).toHaveBeenCalled();
    expect(backendService.deleteReview).toHaveBeenCalledWith(7, 3);
    expect(deletedSpy).toHaveBeenCalled();
    expect(changedSpy).toHaveBeenCalledWith(false);
    expect(appService.dataLoading).toBe(false);
  });

  it('shows an error snackbar when deletion fails', () => {
    backendService.deleteReview.mockReturnValueOnce(of(false));

    component.deleteReview();

    expect(snackBar.open).toHaveBeenCalledWith(
      'workspace.review-not-deleted',
      'workspace.error',
      { duration: 3000 }
    );
  });
});
