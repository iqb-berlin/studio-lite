import { UnitDefinitionDto, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import {
  findVariableIdConflicts, hasCodingScheme, VariableIdConflict, VeronaModuleFactory
} from '@studio-lite/shared-code';
import { matchDefinitionType } from './definition-type-match.utils';

export type ModuleType = 'editor' | 'player' | 'schemer';

/** What the check needs to know of an installed module. */
export interface InstalledModule {
  nameAndVersion: string;
  metadata?: { model?: string };
}

export interface UnitCheckInput {
  /** The modules the unit names, as entered, saved or not; undefined: not loaded. */
  modules: Partial<Record<ModuleType, string>> | undefined;
  installed: Record<ModuleType, Record<string, InstalledModule>>;
  /** undefined: not loaded (yet). */
  definition: UnitDefinitionDto | undefined;
  scheme: UnitSchemeDto | undefined;
  /** undefined: not known (yet). */
  hasComments: boolean | undefined;
  hasRichNotes: boolean | undefined;
  hiddenRoutes: string[];
}

/** A finding: an i18n key and the values it is filled with. */
export interface UnitCheckFinding {
  key: string;
  params?: Record<string, string>;
}

export interface UnitCheckSection {
  /** The route of the tab, which also names it (`workspace.routes.<tab>`). */
  tab: 'properties' | 'editor' | 'schemer' | 'comments' | 'notes';
  findings: UnitCheckFinding[];
  /** Ids the export would write twice; listed apart, since the card shows how to resolve them. */
  variableIdConflicts: VariableIdConflict[];
  /** Nothing found and no conflicts. */
  ok: boolean;
  /** For comments and rich notes: whether there are any. Not a finding -- neither is required. */
  info?: UnitCheckFinding;
}

const MODULE_TYPES: ModuleType[] = ['editor', 'player', 'schemer'];

/** The installed module a unit's module key opens with: the key itself, or a later minor version. */
function installedModule(
  key: string | undefined,
  installed: Record<string, InstalledModule>
): InstalledModule | undefined {
  if (!key) return undefined;
  return installed[VeronaModuleFactory.getBestMatch(key, Object.keys(installed))];
}

function checkProperties(input: UnitCheckInput): UnitCheckFinding[] {
  const modules = input.modules;
  if (!modules) return [{ key: 'unit-check.not-loaded' }];
  return MODULE_TYPES
    .map((moduleType): UnitCheckFinding | undefined => {
      const key = modules[moduleType];
      // unit-check.no-editor, unit-check.no-player, unit-check.no-schemer
      if (!key) return { key: `unit-check.no-${moduleType}` };
      if (installedModule(key, input.installed[moduleType])) return undefined;
      // unit-check.not-installed-editor, unit-check.not-installed-player, unit-check.not-installed-schemer
      return { key: `unit-check.not-installed-${moduleType}`, params: { module: key } };
    })
    .filter((finding): finding is UnitCheckFinding => !!finding);
}

function checkEditor(input: UnitCheckInput): UnitCheckFinding[] {
  if (!input.definition) return [{ key: 'unit-check.not-loaded' }];
  if (!input.definition.definition) return [{ key: 'unit-check.no-definition' }];
  const player = installedModule(input.modules?.player, input.installed.player);
  const definitionType = input.definition.definitionType;
  if (player && matchDefinitionType(definitionType, player.metadata?.model) === 'incompatible') {
    return [{
      key: 'workspace.definition-type-incompatible',
      params: { player: player.nameAndVersion, definitionType: definitionType || '' }
    }];
  }
  return [];
}

type Checked = Pick<UnitCheckSection, 'findings' | 'variableIdConflicts'>;

function checkScheme(input: UnitCheckInput): Checked {
  if (!input.scheme) return { findings: [{ key: 'unit-check.not-loaded' }], variableIdConflicts: [] };
  if (!hasCodingScheme(input.scheme.scheme)) {
    return { findings: [{ key: 'unit-check.no-scheme' }], variableIdConflicts: [] };
  }
  // without the base variables a conflict with an element cannot be seen, and none found means nothing
  if (!input.definition) return { findings: [{ key: 'unit-check.variables-not-loaded' }], variableIdConflicts: [] };
  // the base variables as the export reads them: from the definition, the editor's unsaved list included
  return {
    findings: [],
    variableIdConflicts: findVariableIdConflicts(input.definition.variables, input.scheme.scheme)
  };
}

/**
 * The state of the unit, tab by tab (#2135): whether its modules are assigned and installed, whether
 * it has content in a format its player reads, whether it has a coding scheme and one whose variables
 * the export can write without writing an id twice, and -- only where the workspace shows these
 * tabs -- whether it has comments and rich notes.
 */
export function checkUnit(input: UnitCheckInput): UnitCheckSection[] {
  const section = (tab: UnitCheckSection['tab'], checked: Checked): UnitCheckSection => ({
    tab,
    ...checked,
    ok: checked.findings.length === 0 && checked.variableIdConflicts.length === 0
  });
  // unit-check.comments-present, unit-check.comments-absent, unit-check.notes-present, unit-check.notes-absent
  const infoSection = (tab: 'comments' | 'notes', present: boolean | undefined): UnitCheckSection => {
    const presence = present ? 'present' : 'absent';
    return {
      ...section(tab, { findings: [], variableIdConflicts: [] }),
      info: { key: present === undefined ? 'unit-check.not-loaded' : `unit-check.${tab}-${presence}` }
    };
  };
  const sections: UnitCheckSection[] = [
    section('properties', { findings: checkProperties(input), variableIdConflicts: [] }),
    section('editor', { findings: checkEditor(input), variableIdConflicts: [] }),
    section('schemer', checkScheme(input))
  ];
  if (!input.hiddenRoutes.includes('comments')) sections.push(infoSection('comments', input.hasComments));
  if (!input.hiddenRoutes.includes('notes')) sections.push(infoSection('notes', input.hasRichNotes));
  return sections;
}
