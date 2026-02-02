import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { ItemsMetadataValues } from '@studio-lite-lib/api-dto';
import { UnitPrintCommentsComponent } from './unit-print-comments.component';
import { BackendService } from '../../../comments/services/backend.service';
import { Comment } from '../../../comments/models/comment.interface';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintCommentsComponent', () => {
  let component: UnitPrintCommentsComponent;
  let fixture: ComponentFixture<UnitPrintCommentsComponent>;
  let mockBackendService: { getComments: jest.Mock };

  const createMockComment = (id: number): Comment => ({
    id,
    unitId: 1,
    body: `Test comment ${id}`,
    userName: 'Test User',
    userId: 1,
    itemUuids: [],
    hidden: false,
    parentId: null,
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
        },
        {
          provide: BackendService,
          useValue: mockBackendService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintCommentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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

    it('should handle empty comments array', () => {
      mockBackendService.getComments.mockReturnValue(of([]));

      component.unitId = 10;
      component.workspaceId = 1;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(component.comments).toEqual([]);
    });

    it('should not fetch comments if changes do not include relevant properties', () => {
      component.ngOnChanges({
        metadata: new SimpleChange(null, [], false)
      });

      expect(mockBackendService.getComments).not.toHaveBeenCalled();
    });

    it('should use default reviewId of 0 when not set', () => {
      const mockComments = [createMockComment(1)];
      mockBackendService.getComments.mockReturnValue(of(mockComments));

      component.unitId = 10;
      component.workspaceId = 1;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(mockBackendService.getComments).toHaveBeenCalledWith(1, 10, 0);
    });

    it('should pass non-zero reviewId when set', () => {
      const mockComments = [createMockComment(1)];
      mockBackendService.getComments.mockReturnValue(of(mockComments));

      component.unitId = 10;
      component.workspaceId = 1;
      component.reviewId = 15;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(mockBackendService.getComments).toHaveBeenCalledWith(1, 10, 15);
    });
  });

  describe('fetchComments', () => {
    it('should update comments property with fetched data', () => {
      const mockComments = [
        createMockComment(1),
        createMockComment(2),
        createMockComment(3)
      ];
      mockBackendService.getComments.mockReturnValue(of(mockComments));

      component.unitId = 10;
      component.workspaceId = 1;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(component.comments.length).toBe(3);
      expect(component.comments).toEqual(mockComments);
    });

    it('should replace existing comments with new data', () => {
      const oldComments = [createMockComment(1)];
      const newComments = [createMockComment(2), createMockComment(3)];

      mockBackendService.getComments.mockReturnValue(of(oldComments));
      component.unitId = 10;
      component.workspaceId = 1;
      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      mockBackendService.getComments.mockReturnValue(of(newComments));
      component.ngOnChanges({
        unitId: new SimpleChange(10, 11, false)
      });

      expect(component.comments).toEqual(newComments);
      expect(component.comments.length).toBe(2);
    });
  });

  describe('metadata input', () => {
    it('should accept ItemsMetadataValues array', () => {
      const mockMetadata: ItemsMetadataValues[] = [
        { id: 'item1', profiles: [] },
        { id: 'item2', profiles: [] }
      ];

      component.metadata = mockMetadata;

      expect(component.metadata).toEqual(mockMetadata);
    });

    it('should accept null metadata', () => {
      component.metadata = null;

      expect(component.metadata).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should have default values', () => {
      expect(component.reviewId).toBe(0);
      expect(component.comments).toEqual([]);
    });
  });
  describe('ngOnDestroy', () => {
    it('should emit and complete ngUnsubscribe', () => {
      // eslint-disable-next-line @typescript-eslint/dot-notation
      const ngUnsubscribe = component['ngUnsubscribe'];
      const nextSpy = jest.spyOn(ngUnsubscribe, 'next');
      const completeSpy = jest.spyOn(ngUnsubscribe, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

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
