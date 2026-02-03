import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { PrintComponent } from './print.component';
import { PrintOption } from '../../models/print-options.interface';

describe('PrintComponent', () => {
  let component: PrintComponent;
  let fixture: ComponentFixture<PrintComponent>;
  let queryParamMapSubject: ReplaySubject<ParamMap>;

  beforeEach(async () => {
    queryParamMapSubject = new ReplaySubject<ParamMap>(1);

    await TestBed.configureTestingModule({
      imports: [PrintComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: queryParamMapSubject.asObservable() }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component properties from query params', () => {
      const mockParams = {
        get: jest.fn((key: string) => {
          const params: Record<string, string> = {
            printPreviewHeight: '500',
            workspaceId: '10',
            workspaceGroupId: '20'
          };
          return params[key];
        }),
        getAll: jest.fn((key: string) => {
          const params: Record<string, string[]> = {
            printOptions: ['printProperties', 'printMetadata'] as PrintOption[],
            unitIds: ['1', '2', '3']
          };
          return params[key];
        }),
        has: jest.fn(),
        keys: []
      };

      queryParamMapSubject.next(mockParams as unknown as ParamMap);

      component.ngOnInit();

      expect(component.printPreviewHeight).toBe(500);
      expect(component.workspaceId).toBe(10);
      expect(component.workspaceGroupId).toBe(20);
      expect(component.printOptions).toEqual(['printProperties', 'printMetadata']);
      expect(component.unitIds).toEqual([1, 2, 3]);
    });

    it('should handle empty query params', () => {
      const mockParams = {
        get: jest.fn(() => null),
        getAll: jest.fn(() => []),
        has: jest.fn(),
        keys: []
      };

      queryParamMapSubject.next(mockParams as unknown as ParamMap);

      component.ngOnInit();

      expect(component.printPreviewHeight).toBe(0);
      expect(component.workspaceId).toBe(0);
      expect(component.workspaceGroupId).toBe(0);
      expect(component.printOptions).toEqual([]);
      expect(component.unitIds).toEqual([]);
    });

    it('should convert string unitIds to numbers', () => {
      const mockParams = {
        get: jest.fn(() => '100'),
        getAll: jest.fn((key: string) => {
          if (key === 'unitIds') return ['5', '10', '15'];
          return [];
        }),
        has: jest.fn(),
        keys: []
      };

      queryParamMapSubject.next(mockParams as unknown as ParamMap);

      component.ngOnInit();

      expect(component.unitIds).toEqual([5, 10, 15]);
      component.unitIds.forEach(id => {
        expect(typeof id).toBe('number');
      });
    });
  });

  describe('addToScrollPosition', () => {
    it('should increase scroll position by given summand', () => {
      const mockScrollContainer = {
        nativeElement: {
          scrollTop: 100
        }
      };
      component.scrollContainer = mockScrollContainer as never;

      component.addToScrollPosition(50);

      expect(mockScrollContainer.nativeElement.scrollTop).toBe(150);
    });

    it('should decrease scroll position with negative summand', () => {
      const mockScrollContainer = {
        nativeElement: {
          scrollTop: 100
        }
      };
      component.scrollContainer = mockScrollContainer as never;

      component.addToScrollPosition(-30);

      expect(mockScrollContainer.nativeElement.scrollTop).toBe(70);
    });

    it('should handle zero summand', () => {
      const mockScrollContainer = {
        nativeElement: {
          scrollTop: 100
        }
      };
      component.scrollContainer = mockScrollContainer as never;

      component.addToScrollPosition(0);

      expect(mockScrollContainer.nativeElement.scrollTop).toBe(100);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from queryParamMap', () => {
      const mockParams1 = {
        get: jest.fn().mockReturnValue('500'),
        getAll: jest.fn().mockReturnValue([]),
        has: jest.fn(),
        keys: []
      } as unknown as ParamMap;

      const mockParams2 = {
        get: jest.fn().mockReturnValue('600'),
        getAll: jest.fn().mockReturnValue([]),
        has: jest.fn(),
        keys: []
      } as unknown as ParamMap;

      component.ngOnInit();
      queryParamMapSubject.next(mockParams1);

      expect(component.printPreviewHeight).toBe(500);

      component.ngOnDestroy();
      queryParamMapSubject.next(mockParams2);

      // Should still be 500, not 600
      expect(component.printPreviewHeight).toBe(500);
    });
  });
});
