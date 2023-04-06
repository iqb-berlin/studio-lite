import { UnitMetadataStore } from './unit-metadata-store';

describe('UnitMetadataStore', () => {
  it('should create an instance', () => {
    expect(new UnitMetadataStore({ id: 0 })).toBeTruthy();
  });
});
