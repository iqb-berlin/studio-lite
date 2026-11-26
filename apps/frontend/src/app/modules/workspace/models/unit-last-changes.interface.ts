/** When a part of a unit was last changed, and by whom as far as the server knows. */
export interface LastChange {
  at: Date;
  user?: string;
}

/**
 * The last changes of the open unit by part: its properties and metadata, its definition and its
 * coding scheme. A part never changed has none.
 */
export interface UnitLastChanges {
  metadata?: LastChange;
  definition?: LastChange;
  scheme?: LastChange;
}
