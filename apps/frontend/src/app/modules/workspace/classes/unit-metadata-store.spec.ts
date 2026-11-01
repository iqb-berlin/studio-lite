import { UnitMetadataValues, UnitPropertiesDto } from '@studio-lite-lib/api-dto';
import { UnitMetadataStore } from './unit-metadata-store';

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
  schemer: 's1',
  metadata: { profiles: [] }
});

describe('UnitMetadataStore', () => {
  it('tracks player/editor/schemer changes and emits', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
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
    const store = new UnitMetadataStore(buildBaseProperties());

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
    const store = new UnitMetadataStore(buildBaseProperties());

    store.setPlayer('p2');
    store.setPlayer('p1');

    expect(store.isChanged()).toBe(false);
    expect(store.getChangedData()).toEqual({ id: 10 });
  });

  // #1992: an emptied value set back was kept as a change, and saving emptied the unit's group
  it('clears a change to an empty value when the loaded value is set again', () => {
    const store = new UnitMetadataStore(buildBaseProperties());

    store.setBasicData('k1', 'n1', 'd1', '', 't1', 'r1', 'draft');
    store.setBasicData('k1', 'n1', 'd1', 'g1', 't1', 'r1', 'draft');
    store.setPlayer('');
    store.setPlayer('p1');

    expect(store.changed()).toBe(false);
    expect(store.getChangedData()).toEqual({ id: 10 });
  });

  it('clones metadata changes and does not share references', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    const metadata: UnitMetadataValues = {
      profiles: [{ profileId: 'p1', entries: [] }]
    };

    store.setMetadata(metadata);
    metadata.profiles?.push({ profileId: 'p2', entries: [] });

    const changed = store.getChangedData().metadata;
    expect(changed).toEqual({ profiles: [{ profileId: 'p1', entries: [] }] });
  });

  it('applyChanges persists merged data and restores state', () => {
    const store = new UnitMetadataStore(buildBaseProperties());

    store.setPlayer('p2');
    store.applyChanges(store.getChangedData());

    expect(store.isChanged()).toBe(false);
    expect(store.getData().player).toBe('p2');
    expect(store.getChangedData()).toEqual({ id: 10 });
  });

  it('restore resets change set and emits', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setEditor('e2');
    store.restore();

    expect(store.getChangedData()).toEqual({ id: 10 });
    expect(store.isChanged()).toBe(false);
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  it('reloadMetadata takes the stored metadata as new original and keeps other changes', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);
    const stored = { items: [{ id: 'item1', uuid: 'uuid-1' }] };

    store.setMetadata({ items: [{ id: 'item1' }] });
    const sent = store.getChangedData();
    store.setPlayer('p2');
    store.applyChanges(sent);
    store.reloadMetadata(stored);

    expect(store.getData().metadata).toEqual(stored);
    expect(store.getChangedData()).toEqual({ id: 10, player: 'p2' });
    expect(emitSpy).toHaveBeenCalledTimes(4);

    store.setMetadata({ items: [{ id: 'item1', uuid: 'uuid-1' }] });
    expect(store.getChangedData().metadata).toBeUndefined();
  });

  // #1845: what is edited while a save is under way was not sent and must stay a change
  it('applyChanges takes only what was sent as saved', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    store.setBasicData('k1', 'n1', 'before', 'g1', 't1', 'r1', 'draft');
    const sent = store.getChangedData();

    store.setBasicData('k1', 'n1', 'before and after', 'g1', 't1', 'r1', 'draft');
    store.applyChanges(sent);

    expect(store.getChangedData()).toEqual({ id: 10, description: 'before and after' });
    expect(store.changed()).toBe(true);
  });

  // #2087: set back to the loaded value while the save was under way, a field differs from what was saved
  it.each<[string, (store: UnitMetadataStore, back: boolean) => void, Partial<UnitPropertiesDto>]>([
    ['name', (store, back) => store.setBasicData('k1', back ? 'n1' : 'n2', 'd1', 'g1', 't1', 'r1', 'draft'),
      { name: 'n1' }],
    ['metadata', (store, back) => store.setMetadata(back ? { profiles: [] } : { items: [{ id: 'i1', uuid: 'u1' }] }),
      { metadata: { profiles: [] } }]
  ])('keeps the %s set back while the save is under way as a change', (_, edit, setBack) => {
    const store = new UnitMetadataStore(buildBaseProperties());
    edit(store, false);
    const sent = store.getChangedData();

    edit(store, true);
    store.applyChanges(sent);

    expect(store.changed()).toBe(true);
    expect(store.getChangedData()).toEqual({ id: 10, ...setBack });
  });

  it('hands out a copy that later edits do not change', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    store.setMetadata({ items: [{ id: 'item1' }] });
    const sent = store.getChangedData();

    store.setMetadata({ items: [{ id: 'item1' }, { id: 'item2' }] });

    expect(sent.metadata).toEqual({ items: [{ id: 'item1' }] });
  });

  it('reloadMetadata keeps metadata edited again while the save was under way', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    store.setMetadata({ items: [{ id: 'item1' }] });
    const sent = store.getChangedData();

    store.setMetadata({ items: [{ id: 'item1' }, { id: 'item2' }] });
    store.applyChanges(sent);
    store.reloadMetadata({ items: [{ id: 'item1', uuid: 'uuid-1' }] });

    expect(store.getData().metadata).toEqual({ items: [{ id: 'item1', uuid: 'uuid-1' }, { id: 'item2' }] });
    expect(store.changed()).toBe(true);
  });

  // #2094: a new item edited again while its save was under way kept no uuid, and the next save had the
  // server delete it and create it anew, links and all (#1830); an item added meanwhile stays new
  it('gives an item edited while its save was under way the uuid the save gave it', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    store.setMetadata({ items: [{ id: 'item1', description: 'gesendet' }] });
    const sent = store.getChangedData();

    store.setMetadata({ items: [{ id: 'item1', description: 'danach' }, { id: 'item2' }] });
    store.applyChanges(sent);
    store.reloadMetadata({ items: [{ id: 'item1', description: 'gesendet', uuid: 'uuid-1' }] });

    expect(store.getChangedData().metadata).toEqual({
      items: [{ id: 'item1', description: 'danach', uuid: 'uuid-1' }, { id: 'item2' }]
    });
  });

  it('holds in changed whether anything is unsaved', () => {
    const store = new UnitMetadataStore(buildBaseProperties());
    expect(store.changed()).toBe(false);

    store.setPlayer('p2');
    expect(store.changed()).toBe(true);
    store.setPlayer('p1');
    expect(store.changed()).toBe(false);

    store.setMetadata({ items: [{ id: 'item1' }] });
    expect(store.changed()).toBe(true);
    store.applyChanges(store.getChangedData());
    store.reloadMetadata({ items: [{ id: 'item1', uuid: 'uuid-1' }] });
    expect(store.changed()).toBe(false);

    store.setBasicData('k2', 'n1', 'd1', 'g1', 't1', 'r1', 'draft');
    expect(store.changed()).toBe(true);
    store.applyChanges(store.getChangedData());
    expect(store.changed()).toBe(false);

    store.setPlayer('p2');
    store.restore();
    expect(store.changed()).toBe(false);
  });
});
