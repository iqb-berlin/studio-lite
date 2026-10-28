import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  describe('EventEmitter', () => {
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
});
