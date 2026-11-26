import { UnitMetadataValues } from '@studio-lite-lib/api-dto';
import { UnitMetadataStore } from './unit-metadata-store';

const stored = (): UnitMetadataValues => ({ profiles: [] });

describe('UnitMetadataStore', () => {
  it('clones metadata changes and does not share references', () => {
    const store = new UnitMetadataStore(10, stored());
    const metadata: UnitMetadataValues = {
      profiles: [{ profileId: 'p1', entries: [] }]
    };

    store.setMetadata(metadata);
    metadata.profiles?.push({ profileId: 'p2', entries: [] });

    expect(store.getChangedData()).toEqual({ profiles: [{ profileId: 'p1', entries: [] }] });
  });

  it('takes metadata set back to the stored ones for no change', () => {
    const store = new UnitMetadataStore(10, stored());

    store.setMetadata({ items: [{ id: 'item1' }] });
    store.setMetadata(stored());

    expect(store.changed()).toBe(false);
    expect(store.getChangedData()).toBeUndefined();
  });

  // for whoever derives from the metadata as they are edited, as the unit check does (#2235)
  it('gives the metadata as they are edited, restored and saved as a signal', () => {
    const store = new UnitMetadataStore(10, stored());
    const edited = { items: [{ id: 'item1' }] };
    const saved = { items: [{ id: 'item1', uuid: 'uuid-1' }] };

    expect(store.data()).toEqual(stored());
    store.setMetadata(edited);
    expect(store.data()).toEqual(edited);
    store.restore();
    expect(store.data()).toEqual(stored());
    store.setMetadata(edited);
    store.applySaved(edited, saved);
    expect(store.data()).toEqual(saved);
  });

  it('restore drops what was edited and emits', () => {
    const store = new UnitMetadataStore(10, stored());
    const emitSpy = jest.fn();
    store.dataChange.subscribe(emitSpy);

    store.setMetadata({ items: [{ id: 'item1' }] });
    store.restore();

    expect(store.changed()).toBe(false);
    expect(store.getData()).toEqual(stored());
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });

  // #1830: new items get their uuid on the server only; named as new again, the next save recreated them
  it('takes the metadata as stored by the save as the new starting point', () => {
    const store = new UnitMetadataStore(10, stored());
    const saved = { items: [{ id: 'item1', uuid: 'uuid-1' }] };
    store.setMetadata({ items: [{ id: 'item1' }] });
    const sent = store.getChangedData() as UnitMetadataValues;

    store.applySaved(sent, saved);

    expect(store.getData()).toEqual(saved);
    expect(store.changed()).toBe(false);
    store.setMetadata({ items: [{ id: 'item1', uuid: 'uuid-1' }] });
    expect(store.getChangedData()).toBeUndefined();
  });

  it('hands out a copy that later edits do not change', () => {
    const store = new UnitMetadataStore(10, stored());
    store.setMetadata({ items: [{ id: 'item1' }] });
    const sent = store.getChangedData();

    store.setMetadata({ items: [{ id: 'item1' }, { id: 'item2' }] });

    expect(sent).toEqual({ items: [{ id: 'item1' }] });
  });

  // #1845: what is edited while a save is under way was not sent and must stay a change
  it('keeps metadata edited again while the save was under way', () => {
    const store = new UnitMetadataStore(10, stored());
    store.setMetadata({ items: [{ id: 'item1' }] });
    const sent = store.getChangedData() as UnitMetadataValues;

    store.setMetadata({ items: [{ id: 'item1' }, { id: 'item2' }] });
    store.applySaved(sent, { items: [{ id: 'item1', uuid: 'uuid-1' }] });

    expect(store.getData()).toEqual({ items: [{ id: 'item1', uuid: 'uuid-1' }, { id: 'item2' }] });
    expect(store.changed()).toBe(true);
  });

  // #2087: set back to the stored value while the save was under way, it differs from what was saved
  it('keeps metadata set back while the save is under way as a change', () => {
    const store = new UnitMetadataStore(10, stored());
    store.setMetadata({ items: [{ id: 'i1', uuid: 'u1' }] });
    const sent = store.getChangedData() as UnitMetadataValues;

    store.setMetadata(stored());
    store.applySaved(sent, { items: [{ id: 'i1', uuid: 'u1' }] });

    expect(store.changed()).toBe(true);
    expect(store.getChangedData()).toEqual(stored());
  });

  // #2094: a new item edited again while its save was under way kept no uuid, and the next save had the
  // server delete it and create it anew, links and all (#1830); an item added meanwhile stays new
  it('gives an item edited while its save was under way the uuid the save gave it', () => {
    const store = new UnitMetadataStore(10, stored());
    store.setMetadata({ items: [{ id: 'item1', description: 'gesendet' }] });
    const sent = store.getChangedData() as UnitMetadataValues;

    store.setMetadata({ items: [{ id: 'item1', description: 'danach' }, { id: 'item2' }] });
    store.applySaved(sent, { items: [{ id: 'item1', description: 'gesendet', uuid: 'uuid-1' }] });

    expect(store.getChangedData()).toEqual({
      items: [{ id: 'item1', description: 'danach', uuid: 'uuid-1' }, { id: 'item2' }]
    });
  });
});
