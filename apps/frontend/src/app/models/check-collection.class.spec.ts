import { CheckCollection, userLabel } from './check-collection.class';

type Entry = { name: string, isChecked: boolean, label?: string };

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

  it('should order entries by the text they are listed under, where that is not their name (#2145)', () => {
    const collection = new EntriesToCheck([
      { name: 'anna', label: 'Zimmer, Anna (anna)', isChecked: false },
      { name: 'bert', isChecked: false },
      { name: 'zoe', label: 'Abel, Zoe (zoe)', isChecked: false }
    ]);

    collection.sortEntries();

    expect(collection.entries.map(entry => entry.name)).toEqual(['zoe', 'bert', 'anna']);
  });
});

describe('userLabel', () => {
  it('should put the login name behind the display name, and stand alone without one', () => {
    expect(userLabel({ name: 'zoe', displayName: 'Abel, Zoe' })).toBe('Abel, Zoe (zoe)');
    expect(userLabel({ name: 'bert' })).toBe('bert');
  });
});
