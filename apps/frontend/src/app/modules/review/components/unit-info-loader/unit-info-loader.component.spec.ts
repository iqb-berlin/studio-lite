import {
  ComponentFixture, TestBed, fakeAsync, tick
} from '@angular/core/testing';
import { UnitInfoLoaderComponent } from './unit-info-loader.component';

describe('UnitInfoLoaderComponent', () => {
  let component: UnitInfoLoaderComponent;
  let fixture: ComponentFixture<UnitInfoLoaderComponent>;
  let mockObserve: jest.Mock;
  let mockUnobserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let intersectionObserverCallback: IntersectionObserverCallback;

  beforeEach(async () => {
    mockObserve = jest.fn();
    mockUnobserve = jest.fn();
    mockDisconnect = jest.fn();

    const mockIntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      intersectionObserverCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: mockDisconnect
      };
    });

    window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [UnitInfoLoaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UnitInfoLoaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize IntersectionObserver in constructor', () => {
      expect(component.intersectionObserver).toBeDefined();
    });

    it('should initialize with spinnerOn as false', () => {
      expect(component.spinnerOn).toBe(false);
    });

    it('should initialize with isInView as false', () => {
      expect(component.isInView).toBe(false);
    });

    it('should create IntersectionObserver with correct configuration', () => {
      expect(window.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { root: document }
      );
    });
  });

  describe('loaderOn Input Setter', () => {
    it('should set spinnerOn to true when loaderOn is true', () => {
      component.loaderOn = true;
      expect(component.spinnerOn).toBe(true);
    });

    it('should set spinnerOn to false when loaderOn is false', () => {
      component.loaderOn = false;
      expect(component.spinnerOn).toBe(false);
    });

    it('should handle multiple updates to loaderOn', () => {
      component.loaderOn = true;
      expect(component.spinnerOn).toBe(true);

      component.loaderOn = false;
      expect(component.spinnerOn).toBe(false);

      component.loaderOn = true;
      expect(component.spinnerOn).toBe(true);
    });
  });

  describe('ngAfterViewInit()', () => {
    it('should observe element after view init', fakeAsync(() => {
      component.ngAfterViewInit();
      tick();

      expect(mockObserve).toHaveBeenCalledWith(fixture.nativeElement);
    }));

    it('should use setTimeout for observation setup', fakeAsync(() => {
      component.ngAfterViewInit();

      expect(mockObserve).not.toHaveBeenCalled();

      tick();

      expect(mockObserve).toHaveBeenCalled();
    }));
  });

  describe('IntersectionObserver Callback', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should set isInView to true and emit onEnter when element is intersecting', () => {
      const emitSpy = jest.spyOn(component.onEnter, 'emit');
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: true } as IntersectionObserverEntry
      ];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);

      expect(component.isInView).toBe(true);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should set isInView to false when element is not intersecting', () => {
      component.isInView = true;
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: false } as IntersectionObserverEntry
      ];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);

      expect(component.isInView).toBe(false);
    });

    it('should not emit onEnter when element is not intersecting', () => {
      const emitSpy = jest.spyOn(component.onEnter, 'emit');
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: false } as IntersectionObserverEntry
      ];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple intersecting entries', () => {
      const emitSpy = jest.spyOn(component.onEnter, 'emit');
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: true } as IntersectionObserverEntry,
        { isIntersecting: true } as IntersectionObserverEntry
      ];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);

      expect(component.isInView).toBe(true);
      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle mixed intersecting and non-intersecting entries', () => {
      const emitSpy = jest.spyOn(component.onEnter, 'emit');
      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: false } as IntersectionObserverEntry,
        { isIntersecting: true } as IntersectionObserverEntry
      ];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);

      expect(component.isInView).toBe(true);
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should handle empty entries array', () => {
      component.isInView = true;
      const mockEntries: IntersectionObserverEntry[] = [];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);

      expect(component.isInView).toBe(false);
    });
  });

  describe('ngOnDestroy()', () => {
    beforeEach(fakeAsync(() => {
      fixture.detectChanges();
      tick();
    }));

    it('should unobserve element on destroy', () => {
      component.ngOnDestroy();

      expect(mockUnobserve).toHaveBeenCalledWith(fixture.nativeElement);
    });

    it('should disconnect IntersectionObserver on destroy', () => {
      component.ngOnDestroy();

      expect(mockDisconnect).toHaveBeenCalled();
    });

    it('should call both unobserve and disconnect', () => {
      component.ngOnDestroy();

      expect(mockUnobserve).toHaveBeenCalled();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('EventEmitter', () => {
    it('should have onEnter EventEmitter', () => {
      expect(component.onEnter).toBeDefined();
    });

    it('should emit onEnter event when element becomes visible', done => {
      fixture.detectChanges();

      component.onEnter.subscribe(() => {
        expect(component.isInView).toBe(true);
        done();
      });

      const mockEntries: IntersectionObserverEntry[] = [
        { isIntersecting: true } as IntersectionObserverEntry
      ];

      intersectionObserverCallback(mockEntries, component.intersectionObserver);
    });
  });

  describe('Spinner Display', () => {
    it('should display spinner when spinnerOn is true', () => {
      component.spinnerOn = true;
      fixture.detectChanges();

      expect(component.spinnerOn).toBe(true);
    });

    it('should hide spinner when spinnerOn is false', () => {
      component.spinnerOn = false;
      fixture.detectChanges();

      expect(component.spinnerOn).toBe(false);
    });
  });
});
