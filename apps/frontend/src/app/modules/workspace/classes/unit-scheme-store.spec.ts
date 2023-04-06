import { UnitSchemeStore } from './unit-scheme-store';

describe('UnitSchemeStore', () => {
  it('should create an instance', () => {
    expect(new UnitSchemeStore(0, { scheme: '', schemeType: '' })).toBeTruthy();
  });
});
