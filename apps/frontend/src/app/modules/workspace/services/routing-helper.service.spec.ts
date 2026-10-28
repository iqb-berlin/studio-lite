import { RoutingHelperService } from './routing-helper.service';

describe('RoutingHelperService', () => {
  describe('getSecondaryOutlet', () => {
    // The view pinned beside the unit's tab sits in the secondary outlet nested in the primary one (#1972).
    it.each([
      ['/a/5/7/(editor//secondary:preview)', 'preview'],
      ['/a/5/7/editor', null],
      ['', null]
    ])('should read the view pinned in %j as %j', (url, outlet) => {
      expect(RoutingHelperService.getSecondaryOutlet(url, 'primary', 'secondary')).toBe(outlet);
    });
  });
});
