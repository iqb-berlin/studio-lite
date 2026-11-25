import { UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { UnitPropertiesStore } from './unit-properties-store';

const buildBaseProperties = (): UnitPropertiesDto => ({
  id: 10,
  key: 'k1',
  name: 'n1',
  groupName: 'g1',
  state: 'draft',
  description: 'd1',
  transcript: 't1',
  reference: 'r1',
  player: 'p1',
  editor: 'e1',
  schemer: 's1'
});

describe('UnitPropertiesStore', () => {
  it('tracks player/editor/schemer changes and emits', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setPlayer('p2');
    store.setEditor('e2');
    store.setSchemer('s2');

    expect(store.isChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({
      id: 10,
      player: 'p2',
      editor: 'e2',
      schemer: 's2'
    });
    expect(emitSpy).toHaveBeenCalledTimes(3);
  });

  it('updates basic data and detects key/name/group/state changes', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());

    store.setBasicData('k2', 'n2', 'd2', 'g2', 't2', 'r2', 'published');

    expect(store.isChanged()).toBe(true);
    expect(store.isKeyOrNameOrGroupOrStateChanged()).toBe(true);
    expect(store.getChangedData()).toEqual({
      id: 10,
      key: 'k2',
      name: 'n2',
      description: 'd2',
      groupName: 'g2',
      transcript: 't2',
      reference: 'r2',
      state: 'published'
    });
  });

  it('clears changes when new values match original', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());

    store.setPlayer('p2');
    store.setPlayer('p1');

    expect(store.isChanged()).toBe(false);
    expect(store.getChangedData()).toEqual({ id: 10 });
  });

  // #1992: an emptied value set back was kept as a change, and saving emptied the unit's group
  it('clears a change to an empty value when the loaded value is set again', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());

    store.setBasicData('k1', 'n1', 'd1', '', 't1', 'r1', 'draft');
    store.setBasicData('k1', 'n1', 'd1', 'g1', 't1', 'r1', 'draft');
    store.setPlayer('');
    store.setPlayer('p1');

    expect(store.changed()).toBe(false);
    expect(store.getChangedData()).toEqual({ id: 10 });
  });

  it('applyChanges persists merged data and restores state', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());

    store.setPlayer('p2');
    store.applyChanges(store.getChangedData());

    expect(store.isChanged()).toBe(false);
    expect(store.getData().player).toBe('p2');
    expect(store.getChangedData()).toEqual({ id: 10 });
  });

  it('restore resets change set and emits', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setEditor('e2');
    store.restore();

    expect(store.getChangedData()).toEqual({ id: 10 });
    expect(store.isChanged()).toBe(false);
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  // #1845: what is edited while a save is under way was not sent and must stay a change
  it('applyChanges takes only what was sent as saved', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());
    store.setBasicData('k1', 'n1', 'before', 'g1', 't1', 'r1', 'draft');
    const sent = store.getChangedData();

    store.setBasicData('k1', 'n1', 'before and after', 'g1', 't1', 'r1', 'draft');
    store.applyChanges(sent);

    expect(store.getChangedData()).toEqual({ id: 10, description: 'before and after' });
    expect(store.changed()).toBe(true);
  });

  // #2087: set back to the loaded value while the save was under way, a field differs from what was saved
  it('keeps the name set back while the save is under way as a change', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());
    store.setBasicData('k1', 'n2', 'd1', 'g1', 't1', 'r1', 'draft');
    const sent = store.getChangedData();

    store.setBasicData('k1', 'n1', 'd1', 'g1', 't1', 'r1', 'draft');
    store.applyChanges(sent);

    expect(store.changed()).toBe(true);
    expect(store.getChangedData()).toEqual({ id: 10, name: 'n1' });
  });

  it('holds in changed whether anything is unsaved', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());
    expect(store.changed()).toBe(false);

    store.setPlayer('p2');
    expect(store.changed()).toBe(true);
    store.setPlayer('p1');
    expect(store.changed()).toBe(false);

    store.setBasicData('k2', 'n1', 'd1', 'g1', 't1', 'r1', 'draft');
    expect(store.changed()).toBe(true);
    store.applyChanges(store.getChangedData());
    expect(store.changed()).toBe(false);

    store.setPlayer('p2');
    store.restore();
    expect(store.changed()).toBe(false);
  });

  it('holds in data the modules as entered, saved or not (#2135)', () => {
    const store = new UnitPropertiesStore(buildBaseProperties());
    expect(store.data().player).toBe('p1');

    store.setPlayer('p2');
    expect(store.data().player).toBe('p2');

    store.restore();
    expect(store.data().player).toBe('p1');
  });
});
