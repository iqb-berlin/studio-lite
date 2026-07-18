import {
  ACTIVE_PROFILE_ORDER, HIDDEN_PROFILE_ORDER, isCurrentFromOrder, orderFromCurrent
} from './profile-order';

describe('profile-order', () => {
  describe('orderFromCurrent', () => {
    it('maps the active profile to order 0', () => {
      expect(orderFromCurrent(true)).toBe(ACTIVE_PROFILE_ORDER);
      expect(orderFromCurrent(true)).toBe(0);
    });

    it('maps a non-active profile to order -1 (hidden)', () => {
      expect(orderFromCurrent(false)).toBe(HIDDEN_PROFILE_ORDER);
      expect(orderFromCurrent(false)).toBe(-1);
    });
  });

  describe('isCurrentFromOrder', () => {
    it('treats only order 0 (the primary profile) as current', () => {
      expect(isCurrentFromOrder(0)).toBe(true);
    });

    it('treats a visible but non-primary position (order > 0) as not current', () => {
      expect(isCurrentFromOrder(3)).toBe(false);
    });

    it('treats order -1 as not current (hidden)', () => {
      expect(isCurrentFromOrder(-1)).toBe(false);
    });

    it('treats null/undefined as not current', () => {
      expect(isCurrentFromOrder(null)).toBe(false);
      expect(isCurrentFromOrder(undefined)).toBe(false);
    });
  });
});
