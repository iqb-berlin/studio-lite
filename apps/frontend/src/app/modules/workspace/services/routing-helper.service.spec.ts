import { RoutingHelperService } from './routing-helper.service';

describe('RoutingHelperService', () => {
  describe('getSecondaryOutlet', () => {
    it('should return null when secondary outlet is not present', () => {
      const url = '/workspace/1';
      const result = RoutingHelperService.getSecondaryOutlet(url, 'primary', 'secondary');
      expect(result).toBeNull();
    });

    it('should return null for empty URL', () => {
      const result = RoutingHelperService.getSecondaryOutlet('', 'primary', 'secondary');
      expect(result).toBeNull();
    });
  });
});
