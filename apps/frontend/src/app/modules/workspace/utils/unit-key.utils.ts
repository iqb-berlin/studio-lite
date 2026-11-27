import { UnitInListDto } from '@studio-lite-lib/api-dto';
import type { UnitCheckFinding } from './unit-check.utils';

/**
 * What a unit key has to be, for the forms that enter one and for the unit check that names a key
 * the forms would not have let through -- one that came with an import, say (#2135).
 */
export const UNIT_KEY_MIN_LENGTH = 3;
export const UNIT_KEY_MAX_LENGTH = 20;
export const UNIT_KEY_PATTERN = '[a-zA-Z][a-zA-Z0-9_-]*';
// anchored, as Validators.pattern anchors a pattern given as a string
const UNIT_KEY_REGEXP = new RegExp(`^${UNIT_KEY_PATTERN}$`);

/** Whether another unit of the workspace has the key, upper or lower case and spaces aside. */
export function isUnitKeyTaken(
  key: string,
  unitId: number,
  unitList: { [group: string]: UnitInListDto[] }
): boolean {
  const normalised = key.toUpperCase().trim();
  return Object.values(unitList)
    .flat()
    .some(unit => unit.id !== unitId && unit.key.toUpperCase().trim() === normalised);
}

/**
 * Each rule of the key form the unit's key breaks. A key too short or in another format is saved all
 * the same, as units with such older keys are still worked on (#1842): a hint. One that is missing,
 * taken or longer than the database column cannot be saved.
 */
export function checkUnitKey(
  key: string | undefined,
  unitId: number,
  unitList: { [group: string]: UnitInListDto[] }
): UnitCheckFinding[] {
  // spaces alone are no key: the form refuses them as blank, and the uniqueness check trims
  if (!key?.trim()) return [{ key: 'unit-check.key-missing' }];
  const params = { key };
  const findings: UnitCheckFinding[] = [];
  if (key.length < UNIT_KEY_MIN_LENGTH) {
    findings.push({
      key: 'unit-check.key-too-short',
      params: { ...params, min: String(UNIT_KEY_MIN_LENGTH) },
      level: 'hint'
    });
  }
  if (key.length > UNIT_KEY_MAX_LENGTH) {
    findings.push({ key: 'unit-check.key-too-long', params: { ...params, max: String(UNIT_KEY_MAX_LENGTH) } });
  }
  if (!UNIT_KEY_REGEXP.test(key)) findings.push({ key: 'unit-check.key-format', params, level: 'hint' });
  if (isUnitKeyTaken(key, unitId, unitList)) findings.push({ key: 'unit-check.key-taken', params });
  return findings;
}
