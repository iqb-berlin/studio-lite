import { CheckCollection } from './check-collection.class';

type Entry = { name: string, isChecked: boolean };

class EntriesToCheck extends CheckCollection<Entry> {
  constructor(public entries: Entry[]) {
    super();
  }
}

describe('CheckCollection', () => {
  // The assignment dialogs show the current selection at the top of a long list.
  it('should put the checked entries first and order both parts by name', () => {
    const collection = new EntriesToCheck([
      { name: 'dora', isChecked: false },
      { name: 'Bert', isChecked: true },
      { name: 'carl', isChecked: false },
      { name: 'anna', isChecked: true },
      { name: 'Bea', isChecked: false }
    ]);

    collection.sortEntries();

    expect(collection.entries.map(entry => entry.name)).toEqual(['anna', 'Bert', 'Bea', 'carl', 'dora']);
    expect(collection.checkedCount).toBe(2);
  });
});
