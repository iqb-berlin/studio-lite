import { TestBed } from '@angular/core/testing';
import { RoutingHelperService } from './routing-helper.service';

describe('RoutingHelperService', () => {
  let service: RoutingHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoutingHelperService]
    });
    service = TestBed.inject(RoutingHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getSecondaryOutlet', () => {
    it('should return null when secondary outlet is not present', () => {
      const url = '/workspace/1';
      const result = RoutingHelperService.getSecondaryOutlet(url, 'primary', 'secondary');
      expect(result).toBeNull();
    });

    it('should return null when outlet name does not match', () => {
      const url = '/workspace/1';
      const result = RoutingHelperService.getSecondaryOutlet(url, 'primary', 'other');
      expect(result).toBeNull();
    });

    it('should return null for empty URL', () => {
      const result = RoutingHelperService.getSecondaryOutlet('', 'primary', 'secondary');
      expect(result).toBeNull();
    });

    it('should handle simple path without outlets', () => {
      const url = '/workspace/unit/123';
      const result = RoutingHelperService.getSecondaryOutlet(url, 'primary', 'secondary');
      expect(result).toBeNull();
    });

    it('should return null when primary outlet does not exist', () => {
      const url = '/workspace/1';
      const result = RoutingHelperService.getSecondaryOutlet(url, 'nonexistent', 'secondary');
      expect(result).toBeNull();
    });
  });
});
