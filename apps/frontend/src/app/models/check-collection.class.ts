import { compareText } from '@studio-lite/shared-code';

/**
 * What a collection needs of its entries: whether it is checked and what it is called. An entry
 * that is listed under another text than its name carries that text as its `label`.
 */
interface CheckableEntry {
  isChecked: boolean;
  name: string;
  label?: string;
}

/** The text a user is listed and sorted under: the display name, with the login name behind it. */
export function userLabel(user: { name: string, displayName?: string }): string {
  return user.displayName ? `${user.displayName} (${user.name})` : user.name;
}

/**
 * A list of things to tick, as the assignment dialogs use it -- users to a workspace, workspaces to
 * a user. Sorting brings what is checked to the top and orders both parts by the text an entry is
 * listed under, so a long list shows the current selection without scrolling. Users are listed by
 * their display name, and sorted by their login name they looked unordered (#2145).
 */
export abstract class CheckCollection<T extends CheckableEntry> {
  abstract entries: T[];
  checkedCount: number = 0;

  sortEntries(): void {
    this.entries
      .sort((a, b) => {
        if (a.isChecked === b.isChecked) {
          return compareText(a.label ?? a.name, b.label ?? b.name);
        }
        return a.isChecked ? -1 : 1;
      });
    this.checkedCount = this.entries.filter(e => e.isChecked).length;
  }
}
