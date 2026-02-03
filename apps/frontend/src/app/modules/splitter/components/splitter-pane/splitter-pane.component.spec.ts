import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitterPaneComponent } from './splitter-pane.component';

import { SplitterService } from '../../services/splitter.service';

describe('SplitterPaneComponent', () => {
  let component: SplitterPaneComponent;
  let fixture: ComponentFixture<SplitterPaneComponent>;

  const mockSplitterService = {
    panelSizes: [] as number[],
    update: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitterPaneComponent],
      providers: [
        { provide: SplitterService, useValue: mockSplitterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SplitterPaneComponent);
    component = fixture.componentInstance;
    mockSplitterService.panelSizes = []; // Reset sizes
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('init', () => {
    it('should initialize properties and calling initSize', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const initSizeSpy = jest.spyOn(component as any, 'initSize');
      component.init(1, true);

      expect(component.index).toBe(1);
      expect(component.isLast).toBe(true);
      expect(component.elementRef.nativeElement.style.order).toBe('1');
      expect(initSizeSpy).toHaveBeenCalled();
    });
  });

  describe('initSize', () => {
    it('should use stored size if available and not last pane', () => {
      mockSplitterService.panelSizes[0] = 200;
      component.isLast = false;
      component.index = 0;
      component.initialSize = 100;

      // eslint-disable-next-line @typescript-eslint/dot-notation
      component['initSize']();

      expect(component.size).toBe(200);
      expect(component.elementRef.nativeElement.style.flexBasis).toBe('200px');
    });

    it('should use initialSize if stored size not available', () => {
      component.isLast = false;
      component.index = 0;
      component.initialSize = 150;

      // eslint-disable-next-line @typescript-eslint/dot-notation
      component['initSize']();

      expect(component.size).toBe(150);
      expect(component.elementRef.nativeElement.style.flexBasis).toBe('150px');
    });

    it('should set flex-basis to auto if isLast is true', () => {
      component.isLast = true;
      component.index = 1;

      // eslint-disable-next-line @typescript-eslint/dot-notation
      component['initSize']();

      expect(component.elementRef.nativeElement.style.flexBasis).toBe('auto');
    });

    it('should respect minSize and maxSize', () => {
      component.minSize = 100;
      component.maxSize = 300;
      component.isLast = false;

      // Check min
      component.initialSize = 50;
      // eslint-disable-next-line @typescript-eslint/dot-notation
      component['initSize']();
      expect(component.size).toBe(100);

      // Check max
      component.initialSize = 400;
      // eslint-disable-next-line @typescript-eslint/dot-notation
      component['initSize']();
      expect(component.size).toBe(300);
    });
  });

  describe('calculateSize', () => {
    it('should calculate size correctly when isBeforeGutter is true', () => {
      jest.spyOn(component.elementRef.nativeElement, 'offsetLeft', 'get').mockReturnValue(10);
      component.calculateSize(true, 110, 0);

      expect(component.size).toBe(100); // 110 - 10
    });

    it('should calculate size correctly when isBeforeGutter is false', () => {
      jest.spyOn(component.elementRef.nativeElement, 'offsetLeft', 'get').mockReturnValue(10);
      jest.spyOn(component.elementRef.nativeElement, 'offsetWidth', 'get').mockReturnValue(200);

      // (10 + 200) - 110 - 2 = 98
      component.calculateSize(false, 110, 2);

      expect(component.size).toBe(98);
    });
  });
});
