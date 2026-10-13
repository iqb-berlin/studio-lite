/**
 * Removes from a store's changes the fields that are still what was sent: once the server has
 * stored them, they are no longer changes. A field edited again after sending keeps its new value
 * and stays a change, since nobody sent that value yet (#1845). Values are compared by content,
 * as the stores hold plain data.
 */
export function dropSavedChanges<T extends object>(changes: T, sent: T): void {
  (Object.keys(sent) as (keyof T)[]).forEach(field => {
    if (field in changes && JSON.stringify(changes[field]) === JSON.stringify(sent[field])) {
      delete changes[field];
    }
  });
}
