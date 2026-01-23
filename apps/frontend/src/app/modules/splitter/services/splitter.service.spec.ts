import { TestBed } from '@angular/core/testing';
import { SplitterService } from './splitter.service';

describe('SplitterService', () => {
  let service: SplitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SplitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('update', () => {
    it('should update panelSizes', () => {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1000 });
      service.update([100, 200]);
      expect(service.panelSizes).toEqual([100, 200]);
    });

    it('should not remove panels if total size fits within clientWidth', () => {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 1000 });

      // 100 + 200 + (2 * 2) = 304 < 1000
      service.update([100, 200]);
      expect(service.panelSizes.length).toBe(2);
      expect(service.panelSizes).toEqual([100, 200]);
    });

    it('should remove panels if total size exceeds clientWidth', () => {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 100 });

      // 100 + 200 + (2 * 2) = 304 > 100
      service.update([100, 200]);
      expect(service.panelSizes).toEqual([]);
    });

    it('should remove only necessary panels', () => {
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 105 });

      // [100, 200] -> Sum 304 > 105. Remove 200.
      // [100] -> Sum 102 <= 105. Stop.
      service.update([100, 200]);
      expect(service.panelSizes).toEqual([100]);
    });
  });
});
