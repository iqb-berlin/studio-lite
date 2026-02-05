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
  it('should create an instance', () => {
    expect(new UnitMetadataStore({ id: 0 })).toBeTruthy();
  });

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
    store.applyChanges();

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
});
