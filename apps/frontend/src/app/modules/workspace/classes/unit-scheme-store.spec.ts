import { UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { UnitSchemeStore } from './unit-scheme-store';

describe('UnitSchemeStore', () => {
  it('tracks changes and emits on setData', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setData('s2', 't2');

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({ scheme: 's2', schemeType: 't2' });
    expect(store.getData()).toEqual({ scheme: 's2', schemeType: 't2' });
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('applyChanges persists merged data and resets state', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);

    store.setData('s2', 't2');
    store.applyChanges();

    expect(store.isChanged()).toBe(false);
    expect(store.getData()).toEqual({ scheme: 's2', schemeType: 't2' });
  });

  it('restore resets change set and emits', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setData('s2', 't2');
    store.restore();

    expect(store.isChanged()).toBe(false);
    expect(store.getChangedData()).toEqual({});
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  it('does not mark changed when only scheme changes', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);

    store.setData('s2', 't1');

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({ scheme: 's2', schemeType: 't1' });
  });

  it('does not mark changed when only schemeType changes', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);

    store.setData('s1', 't2');

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({ scheme: 's1', schemeType: 't2' });
  });
});
