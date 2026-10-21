import { CopyUnitDto, MoveToDto } from '@studio-lite-lib/api-dto';
import { unitIdOf, unitIdsOfList } from './unit-ids';

/**
 * How a route that serves two acts tells them apart by the body. The handler and the guards in
 * front of it ask these functions alike, so that a request cannot show a guard one act and the
 * handler the other.
 */

function isObject(body: unknown): body is Record<string, unknown> {
  return typeof body === 'object' && body !== null;
}

/** A body sent to create units is a copy when it says whether to take the comments along. */
export function isCopyBody(body: unknown): body is CopyUnitDto {
  return isObject(body) && 'addComments' in body;
}

/** A body sent to the drop box hands units in when it names a target; without one it returns them. */
export function isSubmissionBody(body: unknown): body is MoveToDto {
  return isObject(body) && 'targetId' in body;
}

/**
 * The units a body sent to create units takes its content from, a malformed id as 0: the units of
 * a copy, the unit to create from, or none for a unit created empty.
 */
export function sourceUnitIdsOf(body: unknown): number[] {
  if (isCopyBody(body)) return unitIdsOfList(body.ids);
  const createFrom = isObject(body) ? body.createFrom : undefined;
  return createFrom ? [unitIdOf(createFrom)] : [];
}
