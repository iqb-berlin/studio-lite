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

  it('marks changed when only the scheme changes, and sends it with its type', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);

    store.setData('s2', 't1');

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({ scheme: 's2', schemeType: 't1' });
  });

  // the type travels with the scheme, as the definition's does with the definition
  it('does not mark changed when only the scheme type changes', () => {
    const original: UnitSchemeDto = { scheme: 's1', schemeType: 't1' };
    const store = new UnitSchemeStore(1, original);

    store.setData('s1', 't2');

    expect(store.isChanged()).toBe(false);
    expect(store.getChangedData()).toEqual({});
  });

  // edited back, the scheme was saved anyway and stamped the unit as changed (#1333)
  it('does not mark changed when the scheme is edited back to the one loaded', () => {
    const store = new UnitSchemeStore(1, { scheme: 's1', schemeType: 't1' });

    store.setData('s2', 't1');
    store.setData('s1', 't1');

    expect(store.isChanged()).toBe(false);
    expect(store.changed()).toBe(false);
    expect(store.getChangedData()).toEqual({});
  });

  // what was saved is s2 now, and the schemer shows s1 (#1845)
  it('marks changed a scheme edited back to the old one while the save is under way', () => {
    const store = new UnitSchemeStore(1, { scheme: 's1', schemeType: 't1' });
    store.setData('s2', 't1');
    const sent = store.getChangedData();

    store.setData('s1', 't1');
    store.applyChanges(sent);

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({ scheme: 's1', schemeType: 't1' });
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

  describe('applyVariables (#2135)', () => {
    const schemeOf = (alias: string): string => JSON.stringify({
      version: '3.0', variableCodings: [{ id: 'text_b', alias, sourceType: 'BASE_NO_VALUE' }]
    });

    it('takes the scheme with the codings renamed as the server renamed them', () => {
      const store = new UnitSchemeStore(1, { scheme: schemeOf('text_1'), schemeType: 't1' });

      store.applyVariables([{ id: 'text_b', alias: 'text_2' }]);

      expect(store.getData().scheme).toBe(schemeOf('text_2'));
      expect(store.isChanged()).toBe(false);
    });

    // measured against the renamed scheme, it would be sent back with the old name
    it('drops a report of the scheme as it was', () => {
      const store = new UnitSchemeStore(1, { scheme: schemeOf('text_1'), schemeType: 't1' });
      store.setData(schemeOf('text_1'), 't1');

      store.applyVariables([{ id: 'text_b', alias: 'text_2' }]);

      expect(store.isChanged()).toBe(false);
      expect(store.getData().scheme).toBe(schemeOf('text_2'));
    });

    it('keeps a scheme edited in the schemer a change, as reported', () => {
      const store = new UnitSchemeStore(1, { scheme: schemeOf('text_1'), schemeType: 't1' });
      store.setData(schemeOf('edited'), 't1');

      store.applyVariables([{ id: 'text_b', alias: 'text_2' }]);

      expect(store.getChangedData()).toEqual({ scheme: schemeOf('edited'), schemeType: 't1' });
    });
  });
});
