import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { AddCommentButtonComponent } from './add-comment-button.component';
import { ReviewService } from '../../services/review.service';
import { CommentDialogComponent } from '../comment-dialog/comment-dialog.component';

describe('AddCommentButtonComponent', () => {
  let component: AddCommentButtonComponent;
  let fixture: ComponentFixture<AddCommentButtonComponent>;
  let mockDialog: jest.Mocked<MatDialog>;
  let mockReviewService: jest.Mocked<ReviewService>;
  let mockDialogRef: jest.Mocked<MatDialogRef<CommentDialogComponent>>;

  beforeEach(async () => {
    mockDialogRef = {
      afterClosed: jest.fn().mockReturnValue(of(undefined))
    } as unknown as jest.Mocked<MatDialogRef<CommentDialogComponent>>;

    mockDialog = {
      open: jest.fn().mockReturnValue(mockDialogRef)
    } as unknown as jest.Mocked<MatDialog>;

    mockReviewService = {
      updateCommentsUnitInfo: jest.fn()
    } as unknown as jest.Mocked<ReviewService>;

    await TestBed.configureTestingModule({
      imports: [
        AddCommentButtonComponent,
        TranslateModule.forRoot(),
        MatIconModule,
        MatTooltipModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: ReviewService, useValue: mockReviewService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddCommentButtonComponent);
    component = fixture.componentInstance;
    component.unitDbId = 123;
    component.showOthersComments = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input Properties', () => {
    it('should have required input properties', () => {
      expect(component.showOthersComments).toBeDefined();
      expect(component.unitDbId).toBeDefined();
    });

    it('should accept showOthersComments input', () => {
      component.showOthersComments = true;
      expect(component.showOthersComments).toBe(true);
    });

    it('should accept unitDbId input', () => {
      component.unitDbId = 456;
      expect(component.unitDbId).toBe(456);
    });
  });

  describe('showReviewDialog()', () => {
    it('should open comment dialog with correct configuration when showOthersComments is false', () => {
      component.showOthersComments = false;
      component.showReviewDialog();

      expect(mockDialog.open).toHaveBeenCalledWith(CommentDialogComponent, {
        width: '1000px',
        height: '400px',
        panelClass: 'review-dialog'
      });
    });

    it('should open comment dialog with correct configuration when showOthersComments is true', () => {
      component.showOthersComments = true;
      component.showReviewDialog();

      expect(mockDialog.open).toHaveBeenCalledWith(CommentDialogComponent, {
        width: '1000px',
        height: '800px',
        panelClass: 'review-dialog'
      });
    });

    it('should update comments unit info after dialog is closed', done => {
      component.unitDbId = 789;
      component.showReviewDialog();

      mockDialogRef.afterClosed().subscribe(() => {
        expect(mockReviewService.updateCommentsUnitInfo).toHaveBeenCalledWith(789);
        done();
      });
    });

    it('should handle dialog closed without errors', () => {
      component.showReviewDialog();

      expect(() => {
        mockDialogRef.afterClosed().subscribe();
      }).not.toThrow();
    });
  });

  describe('Component Dependencies', () => {
    it('should inject MatDialog service', () => {
      expect(mockDialog).toBeDefined();
    });

    it('should inject ReviewService', () => {
      expect(mockReviewService).toBeDefined();
    });
  });
});
