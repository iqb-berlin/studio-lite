/** The two things a collection needs of its entries: whether it is checked and what it is called. */
interface CheckableEntry {
  isChecked: boolean;
  name: string;
}

/**
 * A list of things to tick, as the assignment dialogs use it -- users to a workspace, workspaces to
 * a user. Sorting brings what is checked to the top and orders the rest by name, so a long list
 * shows the current selection without scrolling.
 */
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
