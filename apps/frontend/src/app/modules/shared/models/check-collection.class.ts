interface CheckableEntry {
  isChecked: boolean;
  name: string;
}

export abstract class CheckCollection<T extends CheckableEntry> {
  abstract entries: T[];

  sortEntries(): void {
    this.entries
      .sort((a, b) => {
        if (a.isChecked === b.isChecked) {
          return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }
        return a.isChecked ? -1 : 1;
      });
  }
}
