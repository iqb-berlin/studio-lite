import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { UnitPrintCommentsComponent } from './unit-print-comments.component';
import { UnitPrintCommentComponent } from '../unit-print-comment/unit-print-comment.component';
import { BackendService } from '../../../comments/services/backend.service';
import { Comment } from '../../../comments/models/comment.interface';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintCommentsComponent', () => {
  let component: UnitPrintCommentsComponent;
  let fixture: ComponentFixture<UnitPrintCommentsComponent>;
  let mockBackendService: { getComments: jest.Mock };

  const createMockComment = (id: number, parentId: number | null = null): Comment => ({
    id,
    unitId: 1,
    body: `Test comment ${id}`,
    userName: 'Test User',
    userId: 1,
    itemUuids: [],
    hidden: false,
    parentId,
    createdAt: new Date(),
    changedAt: new Date()
  });

  beforeEach(async () => {
    mockBackendService = {
      getComments: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        UnitPrintCommentsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        {
          provide: 'SERVER_URL',
          useValue: environment.backendUrl
        }
      ]
    })
      .overrideComponent(UnitPrintCommentsComponent, {
        set: {
          providers: [{ provide: BackendService, useValue: mockBackendService }]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(UnitPrintCommentsComponent);
    component = fixture.componentInstance;
  });

  describe('ngOnChanges', () => {
    it('should fetch comments when unitId changes', () => {
      const mockComments = [createMockComment(1), createMockComment(2)];
      mockBackendService.getComments.mockReturnValue(of(mockComments));

      component.unitId = 10;
      component.workspaceId = 1;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(mockBackendService.getComments).toHaveBeenCalledWith(1, 10, 0);
      expect(component.comments).toEqual(mockComments);
    });

    it('should fetch comments when workspaceId changes', () => {
      const mockComments = [createMockComment(1)];
      mockBackendService.getComments.mockReturnValue(of(mockComments));

      component.unitId = 10;
      component.workspaceId = 5;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 5, true)
      });

      expect(mockBackendService.getComments).toHaveBeenCalledWith(5, 10, 0);
      expect(component.comments).toEqual(mockComments);
    });

    it('should fetch comments when reviewId changes', () => {
      const mockComments = [createMockComment(1)];
      mockBackendService.getComments.mockReturnValue(of(mockComments));

      component.unitId = 10;
      component.workspaceId = 1;
      component.reviewId = 7;

      component.ngOnChanges({
        reviewId: new SimpleChange(null, 7, true)
      });

      expect(mockBackendService.getComments).toHaveBeenCalledWith(1, 10, 7);
      expect(component.comments).toEqual(mockComments);
    });

    it('should not fetch comments if changes do not include relevant properties', () => {
      component.ngOnChanges({
        metadata: new SimpleChange(null, [], false)
      });

      expect(mockBackendService.getComments).not.toHaveBeenCalled();
    });
  });

  // A reply written after a later comment was printed under that later comment (#2109).
  it('should print each reply right below the comment it answers', () => {
    mockBackendService.getComments.mockReturnValue(of([
      createMockComment(1), createMockComment(2), createMockComment(3, 1)
    ]));
    fixture.componentRef.setInput('unitId', 10);
    fixture.componentRef.setInput('workspaceId', 1);
    fixture.componentRef.setInput('metadata', []);

    fixture.detectChanges();

    const printed = fixture.debugElement.queryAll(By.directive(UnitPrintCommentComponent))
      .map(debugElement => debugElement.componentInstance as UnitPrintCommentComponent)
      .map(comment => ({ id: comment.comment.id, isReply: comment.isReply, divided: comment.divided }));
    expect(printed).toEqual([
      { id: 1, isReply: false, divided: false },
      { id: 3, isReply: true, divided: false },
      { id: 2, isReply: false, divided: true }
    ]);
  });

  describe('ngOnDestroy', () => {
    it('should cancel subscriptions on destroy', () => {
      const mockComments = [createMockComment(1)];
      const subject = new Subject<Comment[]>();
      mockBackendService.getComments.mockReturnValue(subject.asObservable());

      component.unitId = 10;
      component.workspaceId = 1;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      component.ngOnDestroy();
      subject.next(mockComments);

      expect(component.comments).toEqual([]);
    });
  });
});
