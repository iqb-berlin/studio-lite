/**
 * Removes from the values a store holds as entered the fields that are still what was sent: once
 * the server has stored them, they are the saved values. A field entered again after sending keeps
 * its new value, which the store measures against what is saved (#1845, #2087). Values are compared
 * by content, as the stores hold plain data.
 */
export function dropSavedChanges<T extends object>(changes: T, sent: T): void {
  (Object.keys(sent) as (keyof T)[]).forEach(field => {
    if (field in changes && JSON.stringify(changes[field]) === JSON.stringify(sent[field])) {
      delete changes[field];
    }
  });
}
