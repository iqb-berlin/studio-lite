interface CheckableEntry {
  isChecked: boolean;
  name: string;
}

export abstract class CheckCollection<T extends CheckableEntry> {
  abstract entries: T[];
  checkedCount: number = 0;

  sortEntries(): void {
    this.entries
      .sort((a, b) => {
        if (a.isChecked === b.isChecked) {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        return a.isChecked ? -1 : 1;
      });
    this.checkedCount = this.entries.filter(e => e.isChecked).length;
  }
}
