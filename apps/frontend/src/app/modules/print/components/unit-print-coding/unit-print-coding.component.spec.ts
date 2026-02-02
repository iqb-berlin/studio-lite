import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { VariableCodingData, SourceType } from '@iqbspecs/coding-scheme/coding-scheme.interface';
import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { UnitPrintCodingComponent } from './unit-print-coding.component';
import { WorkspaceBackendService } from '../../../workspace/services/workspace-backend.service';
import { ReviewBackendService } from '../../../review/services/review-backend.service';
import { environment } from '../../../../../environments/environment';

describe('UnitPrintCodingComponent', () => {
  let component: UnitPrintCodingComponent;
  let fixture: ComponentFixture<UnitPrintCodingComponent>;
  let mockWorkspaceBackendService: { getUnitScheme: jest.Mock };
  let mockReviewBackendService: { getUnitScheme: jest.Mock };

  const createMockVariableCoding = (sourceType: SourceType): VariableCodingData => ({
    id: 'var1',
    alias: 'alias1',
    label: 'Label 1',
    sourceType,
    sourceParameters: {},
    deriveSources: [],
    processing: [],
    manualInstruction: '',
    codes: []
  });

  beforeEach(async () => {
    mockWorkspaceBackendService = {
      getUnitScheme: jest.fn()
    };

    mockReviewBackendService = {
      getUnitScheme: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        UnitPrintCodingComponent,
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
          useValue: mockWorkspaceBackendService
        },
        {
          provide: ReviewBackendService,
          useValue: mockReviewBackendService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitPrintCodingComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should fetch codings when workspaceId changes', () => {
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: [
            createMockVariableCoding('MANUAL'),
            createMockVariableCoding('BASE_NO_VALUE')
          ]
        })
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(mockWorkspaceBackendService.getUnitScheme).toHaveBeenCalledWith(1, 10);
      expect(component.codings).toBeDefined();
      expect(component.codings.length).toBe(1);
      expect(component.codings[0].sourceType).not.toBe('BASE_NO_VALUE');
    });

    it('should fetch codings when unitId changes', () => {
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: [createMockVariableCoding('MANUAL')]
        })
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(mockWorkspaceBackendService.getUnitScheme).toHaveBeenCalled();
    });

    it('should use ReviewBackendService when reviewId is set', () => {
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: [createMockVariableCoding('MANUAL')]
        })
      };
      mockReviewBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.reviewId = 5;
      component.unitId = 10;

      component.ngOnChanges({
        reviewId: new SimpleChange(null, 5, true)
      });

      expect(mockReviewBackendService.getUnitScheme).toHaveBeenCalled();
      expect(mockWorkspaceBackendService.getUnitScheme).not.toHaveBeenCalled();
    });

    it('should filter out BASE_NO_VALUE codings', () => {
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: [
            createMockVariableCoding('MANUAL'),
            createMockVariableCoding('BASE_NO_VALUE'),
            createMockVariableCoding('MANUAL'),
            createMockVariableCoding('BASE_NO_VALUE')
          ]
        })
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(component.codings.length).toBe(2);
      expect(component.codings.every(c => c.sourceType !== 'BASE_NO_VALUE')).toBe(true);
    });

    it('should handle empty scheme', () => {
      const mockScheme = {
        scheme: ''
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(component.codings).toBeUndefined();
    });

    it('should handle null scheme response', () => {
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(null));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(component.codings).toBeUndefined();
    });

    it('should not fetch if neither workspaceId nor reviewId is set', () => {
      component.ngOnChanges({
        unitId: new SimpleChange(null, 10, true)
      });

      expect(mockWorkspaceBackendService.getUnitScheme).not.toHaveBeenCalled();
      expect(mockReviewBackendService.getUnitScheme).not.toHaveBeenCalled();
    });

    it('should handle scheme with empty variableCodings array', () => {
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: []
        })
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(component.codings).toEqual([]);
    });

    it('should not process if changes do not include relevant properties', () => {
      component.ngOnChanges({
        otherProperty: new SimpleChange(null, 'value', false)
      });

      expect(mockWorkspaceBackendService.getUnitScheme).not.toHaveBeenCalled();
      expect(mockReviewBackendService.getUnitScheme).not.toHaveBeenCalled();
    });

    it('should prefer workspaceId over reviewId when both are set', () => {
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: [createMockVariableCoding('MANUAL')]
        })
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.reviewId = 5;
      component.unitId = 10;

      component.ngOnChanges({
        reviewId: new SimpleChange(null, 5, true)
      });

      expect(mockWorkspaceBackendService.getUnitScheme).toHaveBeenCalled();
      expect(mockReviewBackendService.getUnitScheme).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle malformed JSON in scheme', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockScheme = {
        scheme: 'invalid json'
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(component.codings).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle scheme without variableCodings property', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const mockScheme = {
        scheme: JSON.stringify({
          otherProperty: 'value'
        })
      };
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(of(mockScheme));

      component.workspaceId = 1;
      component.unitId = 10;

      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      expect(component.codings).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('ngOnDestroy', () => {
    it('should emit and complete ngUnsubscribe', () => {
      // Accessing private property for testing purposes using structural typing
      const ngUnsubscribe = (component as unknown as { ngUnsubscribe: Subject<void> }).ngUnsubscribe;
      const nextSpy = jest.spyOn(ngUnsubscribe, 'next');
      const completeSpy = jest.spyOn(ngUnsubscribe, 'complete');

      component.ngOnDestroy();

      expect(nextSpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should cancel subscriptions on destroy', () => {
      // Simulating a lingering subscription
      const mockScheme = {
        scheme: JSON.stringify({
          variableCodings: [createMockVariableCoding('MANUAL')]
        })
      };

      const subject = new Subject<UnitSchemeDto | null>();
      mockWorkspaceBackendService.getUnitScheme.mockReturnValue(subject.asObservable());

      component.workspaceId = 1;
      component.unitId = 10;

      // Trigger subscription
      component.ngOnChanges({
        workspaceId: new SimpleChange(null, 1, true)
      });

      // Destroy component
      component.ngOnDestroy();

      // Emit value after destroy
      subject.next(mockScheme as unknown as UnitSchemeDto);

      // Should not have processed the value
      expect(component.codings).toBeUndefined();
    });
  });
});
