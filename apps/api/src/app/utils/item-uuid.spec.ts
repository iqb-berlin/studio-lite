import { isItemUuid } from './item-uuid';

describe('isItemUuid', () => {
  it.each(['3f2504e0-4f89-11d3-9a0c-0305e82c3301', '3F2504E0-4F89-11D3-9A0C-0305E82C3301'])(
    'reads %p as an item uuid',
    raw => {
      expect(isItemUuid(raw)).toBe(true);
    }
  );

  it.each([
    'no-item', '', ' 3f2504e0-4f89-11d3-9a0c-0305e82c3301', '3f2504e0-4f89-11d3-9a0c-0305e82c33011',
    '3f2504e04f8911d39a0c0305e82c3301', '{3f2504e0-4f89-11d3-9a0c-0305e82c3301}', 10, null, undefined, {}
  ])(
    'reads %p as no item uuid',
    raw => {
      expect(isItemUuid(raw)).toBe(false);
    }
  );
});
