const collator = new Intl.Collator('de', { numeric: true });

/**
 * Orders two texts the way a dictionary does: upper and lower case count alike, ä/ö/ü stand with
 * a/o/u, and digits are read as numbers (`Unit2` before `Unit10`). Where nothing else differs, the
 * lower-case spelling comes first (`abc` before `Abc`). Texts the dictionary takes for equal
 * (`Unit02` and `Unit2`) fall back to their character codes, so that the order of two different
 * texts never depends on where they stood before.
 *
 * The API and the frontend both sort with this function. Several tables show the order the API
 * sent until a column header is clicked, and the rows must not move on that click (#1872).
 */
export function compareText(a: string, b: string): number {
  const collated = collator.compare(a, b);
  if (collated !== 0 || a === b) return collated;
  return a < b ? -1 : 1;
}

/**
 * A comparison for `Array.sort` by a text of each entry; a missing text counts as empty. With
 * `emptyLast`, entries without a text stand behind all others instead of in front of them.
 */
export function byText<T>(
  text: (item: T) => string | null | undefined,
  emptyLast = false
): (a: T, b: T) => number {
  return (a, b) => {
    const textA = text(a) ?? '';
    const textB = text(b) ?? '';
    if (emptyLast && !textA !== !textB) return textA ? -1 : 1;
    return compareText(textA, textB);
  };
}
