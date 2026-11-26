import { UnitDependency } from '@studio-lite/shared-code';
import type { UnitCheckFinding } from './unit-check.utils';
import { CheckedDependency, checkDependency, InstalledDependencies } from './missing-dependencies.utils';

type Purpose = 'play' | 'edit';

/** What a unit needs for one purpose, as the editor reported it, each with whether the studio has it. */
export interface UnitDependencyList {
  purpose: Purpose;
  /** The list's title, or that nothing is reported -- which does not say that nothing is needed. */
  key: string;
  /**
   * In the order reported: the name, the kind and whether the studio has it, as one text
   * (`unit-check.dependency.<kind>-<state>`), since the word order differs between languages.
   */
  entries: UnitCheckFinding[];
}

export interface CheckedDependencies {
  /** Both lists, to be played first; none where the editor is hidden. */
  lists: UnitDependencyList[];
  findings: UnitCheckFinding[];
}

interface Checked {
  purpose: Purpose;
  entries: CheckedDependency[];
}

/** The keys of what is missing, by kind and purpose; to be played as the preview says it (#1602). */
const MISSING_KEYS: Record<Purpose, Record<'package' | 'widget' | 'file', string>> = {
  play: {
    package: 'workspace.dependencies-missing-packages',
    widget: 'workspace.dependencies-missing-widgets',
    file: 'workspace.dependencies-missing-files'
  },
  edit: {
    package: 'unit-check.dependencies-missing-to-edit-packages',
    widget: 'unit-check.dependencies-missing-to-edit-widgets',
    file: 'unit-check.dependencies-missing-to-edit-files'
  }
};

const isMissing = (entry: CheckedDependency): boolean => entry.state === 'missing' || entry.state === 'not-provided';

/** One finding per kind of which something is missing, naming all of that kind. */
function missingFindings({ purpose, entries }: Checked): UnitCheckFinding[] {
  // without what its editor needs the unit cannot be edited in full, but it is played all the same
  const hint = purpose === 'edit' ? { hint: true } : {};
  return (['package', 'widget', 'file'] as const).flatMap(kind => {
    const names = entries.filter(entry => entry.kind === kind && isMissing(entry)).map(entry => entry.id);
    return names.length ?
      [{ key: MISSING_KEYS[purpose][kind], params: { names: names.join(', ') }, ...hint }] :
      [];
  });
}

function toList({ purpose, entries }: Checked): UnitDependencyList {
  return {
    purpose,
    // unit-check.dependencies-play, unit-check.dependencies-play-none, unit-check.dependencies-edit,
    // unit-check.dependencies-edit-none
    key: `unit-check.dependencies-${purpose}${entries.length ? '' : '-none'}`,
    // unit-check.dependency.package-installed, unit-check.dependency.package-missing,
    // unit-check.dependency.package-unknown, unit-check.dependency.widget-installed,
    // unit-check.dependency.widget-missing, unit-check.dependency.widget-unknown,
    // unit-check.dependency.file-not-provided, unit-check.dependency.service-not-checked
    entries: entries.map(entry => ({
      key: `unit-check.dependency.${entry.kind}-${entry.state}`,
      params: { name: entry.id }
    }))
  };
}

/**
 * What a unit needs to be played and to be edited, and what of it the studio lacks (#2198), checked
 * as the preview checks it. What is missing to be played fails the preview, the export and the test,
 * and is a finding; what is missing only to be edited is a hint, as a missing editor is. That
 * packages and widgets can be installed is said once, after them. Where what is installed could not
 * be read, that is said instead of a finding -- unknown is not missing.
 *
 * Where the editor is hidden, only what is needed to be played is checked, and the lists are left
 * out: the findings stand under the properties then, as the other findings on the content do.
 */
export function checkDependencies(
  dependencies: { toPlay: UnitDependency[] | undefined; toEdit: UnitDependency[] | undefined },
  installed: InstalledDependencies,
  editorShown: boolean
): CheckedDependencies {
  const check = (purpose: Purpose, reported: UnitDependency[] | undefined): Checked => ({
    purpose,
    entries: (reported ?? []).map(dependency => checkDependency(dependency, installed))
  });
  const checked = [
    check('play', dependencies.toPlay),
    ...(editorShown ? [check('edit', dependencies.toEdit)] : [])
  ];
  const unknown = checked.filter(({ entries }) => entries.some(entry => entry.state === 'unknown'));
  const installable = checked.some(({ entries }) => entries
    .some(entry => entry.state === 'missing' && (entry.kind === 'package' || entry.kind === 'widget')));
  const findings: UnitCheckFinding[] = [
    ...checked.flatMap(missingFindings),
    // a hint where only what is needed to be edited could not be checked
    ...(unknown.length ?
      [{
        key: 'unit-check.dependencies-not-checked',
        ...(unknown.every(({ purpose }) => purpose === 'edit') && { hint: true })
      }] :
      []),
    ...(installable ? [{ key: 'workspace.dependencies-missing-install-hint', hint: true }] : [])
  ];
  return { lists: editorShown ? checked.map(toList) : [], findings };
}
