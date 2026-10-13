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
    store.applyChanges(store.getChangedData());

    expect(store.isChanged()).toBe(false);
    expect(store.getData()).toEqual({ scheme: 's2', schemeType: 't2' });
  });

  // #1845: a scheme reported while a save is under way was not sent and must stay a change
  it('applyChanges keeps a scheme reported after sending, whole', () => {
    const store = new UnitSchemeStore(1, { scheme: 's1', schemeType: 't1' });
    store.setData('s2', 't1');
    const sent = store.getChangedData();

    store.setData('s3', 't1');
    store.applyChanges(sent);

    expect(store.getChangedData()).toEqual({ scheme: 's3', schemeType: 't1' });
    expect(store.isChanged()).toBe(true);
    expect(store.getData().scheme).toBe('s3');
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

  it('holds in changed whether a scheme has arrived', () => {
    const store = new UnitSchemeStore(1, { scheme: 's1', schemeType: 't1' });
    expect(store.changed()).toBe(false);

    store.setData('s2', 't2');
    expect(store.changed()).toBe(true);
    store.applyChanges(store.getChangedData());
    expect(store.changed()).toBe(false);

    store.setData('s3', 't2');
    store.restore();
    expect(store.changed()).toBe(false);
  });

  it('holds in data what getData answers', () => {
    const store = new UnitSchemeStore(1, { scheme: 's1', schemeType: 't1' });
    expect(store.data()).toEqual({ scheme: 's1', schemeType: 't1' });

    store.setData('s2', 't2');
    expect(store.data()).toEqual(store.getData());
  });
});
