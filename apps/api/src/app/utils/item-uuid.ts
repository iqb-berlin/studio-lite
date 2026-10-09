/** An item uuid as Postgres writes it: 8-4-4-4-12 hex digits, either case. */
const ITEM_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Whether a request's item uuid (see {@link ItemUuid}) is spelled as one. Anything else is no item,
 * and is not to be looked up: the `uuid` column refuses it with an error, which reached the caller
 * as a 500.
 */
export function isItemUuid(raw: unknown): raw is string {
  return typeof raw === 'string' && ITEM_UUID.test(raw);
}
