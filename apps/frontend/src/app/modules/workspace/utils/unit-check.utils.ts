import { UnitDefinitionDto, UnitDefinitionSummaryDto, UnitSchemeDto } from '@studio-lite-lib/api-dto';
import { VariableInfo } from '@iqbspecs/variable-info/variable-info.interface';
import {
  findVariableIdConflicts, hasCodingScheme, schemeWithVariables, toVariableInfoV1, VariableIdConflict,
  VeronaModuleFactory
} from '@studio-lite/shared-code';
import { playerRejectsDefinitionType } from './definition-type-match.utils';
import { schemeProblemFindings } from './scheme-problems.utils';

export type ModuleType = 'editor' | 'player' | 'schemer';

/** What the check needs to know of an installed module. */
export interface InstalledModule {
  nameAndVersion: string;
  metadata?: { model?: string };
}

export interface UnitCheckInput {
  /** The modules the unit names, as entered, saved or not; undefined: not loaded. */
  modules: Partial<Record<ModuleType, string>> | undefined;
  /** undefined: the lists of installed modules could not be loaded. */
  installed: Record<ModuleType, Record<string, InstalledModule>> | undefined;
  /**
   * Whether there is content, and its format -- of the editor's definition where it is loaded, saved
   * or not, else as the server summarizes the stored one (#2135). undefined: not loaded (yet).
   */
  definition: UnitDefinitionSummaryDto | undefined;
  /**
   * The base variables: the editor's list where its definition is loaded, saved or not, else the list
   * the scheme came with -- the definition itself is not loaded for the check (#2135).
   */
  variables: VariableInfo[] | undefined;
  scheme: UnitSchemeDto | undefined;
  /**
   * What is not saved yet. The save of changed variables renames and drops codings with them, unless a
   * changed scheme is saved after them as the schemer reported it.
   */
  unsaved: { variables: boolean; scheme: boolean };
  /** undefined: not known (yet). */
  hasComments: boolean | undefined;
  hasRichNotes: boolean | undefined;
  hiddenRoutes: string[];
}

/** A finding: an i18n key and the values it is filled with. */
export interface UnitCheckFinding {
  key: string;
  params?: Record<string, string>;
  /**
   * Worth knowing, but nothing fails for it: no preview, export, test or coding. A unit key in an
   * older format, say, which the forms deliberately let through (#1842).
   */
  hint?: boolean;
}

export interface UnitCheckSection {
  /** The route of the tab, which also names it (`workspace.routes.<tab>`). */
  tab: 'properties' | 'editor' | 'schemer' | 'comments' | 'notes';
  /** Problems first, as found, and hints among them. */
  findings: UnitCheckFinding[];
  /** Ids the export would write twice; listed apart, since the card shows how to resolve them. */
  variableIdConflicts: VariableIdConflict[];
  /**
   * What the section shows itself as: a warning where something fails -- a finding that is no hint, or
   * an id written twice -- else something to know (hints, information), else in order.
   */
  status: 'warning' | 'info' | 'ok';
  /**
   * Not a finding: whether there are comments and rich notes, neither of which is required, or
   * that the unit has nothing to code.
   */
  info?: UnitCheckFinding;
}

const MODULE_TYPES: ModuleType[] = ['editor', 'player', 'schemer'];

/** Whether the workspace shows a tab (#2135). */
export function isTabShown(hiddenRoutes: string[], tab: string): boolean {
  return !hiddenRoutes.includes(tab);
}

/**
 * Whether the unit reports nothing to code: every element is one without a value, as texts and
 * images are in an information unit (#2135). Neither not known (undefined) nor no elements at all --
 * a unit without content, or from an editor that reports none -- is such a unit. Audio and video
 * report how often they were played, a number, which the check cannot tell from an answer.
 */
export function hasNothingToCode(variables: VariableInfo[] | undefined): boolean {
  return !!variables?.length && variables.every(variable => toVariableInfoV1(variable).type === 'no-value');
}

/**
 * Whether the unit needs a coding: it has a scheme already, or something to code. Without the
 * scheme loaded, whether it has one is not known, and the coding counts as needed.
 */
function needsCoding(input: UnitCheckInput): boolean {
  return !input.scheme || hasCodingScheme(input.scheme.scheme) || !hasNothingToCode(input.variables);
}

/** The installed module a unit's module key opens with: the key itself, or a later minor version. */
function installedModule(
  key: string | undefined,
  installed: Record<string, InstalledModule> | undefined
): InstalledModule | undefined {
  if (!key || !installed) return undefined;
  return installed[VeronaModuleFactory.getBestMatch(key, Object.keys(installed))];
}

function checkProperties(input: UnitCheckInput): UnitCheckFinding[] {
  const modules = input.modules;
  if (!modules) return [{ key: 'unit-check.not-loaded' }];
  const installed = input.installed;
  const codingNeeded = needsCoding(input);
  const findings = MODULE_TYPES
    // the editor and the schemer are opened in their tabs; one the workspace hides is not needed, and
    // neither is the schemer of a unit with nothing to code. The player stays: the export names it,
    // whether the preview is shown or not.
    .filter(moduleType => moduleType === 'player' ||
      (isTabShown(input.hiddenRoutes, moduleType) && (moduleType !== 'schemer' || codingNeeded)))
    .map((moduleType): UnitCheckFinding | undefined => {
      // without its editor the unit cannot be edited, but it is previewed, exported and coded all the same
      const hint = moduleType === 'editor' ? { hint: true } : {};
      const key = modules[moduleType];
      // unit-check.no-editor, unit-check.no-player, unit-check.no-schemer
      if (!key) return { key: `unit-check.no-${moduleType}`, ...hint };
      // without the lists, whether a module is installed is not known
      if (!installed || installedModule(key, installed[moduleType])) return undefined;
      // unit-check.not-installed-editor, unit-check.not-installed-player, unit-check.not-installed-schemer
      return { key: `unit-check.not-installed-${moduleType}`, params: { module: key }, ...hint };
    })
    .filter((finding): finding is UnitCheckFinding => !!finding);
  return installed ? findings : [{ key: 'unit-check.modules-not-loaded' }, ...findings];
}

/** The summary of a definition the editor holds, as the server gives it for a stored one (#2135). */
export function definitionSummary(definition: UnitDefinitionDto): UnitDefinitionSummaryDto {
  return {
    hasDefinition: !!definition.definition,
    ...(definition.definitionType && { definitionType: definition.definitionType })
  };
}

function checkEditor(input: UnitCheckInput): UnitCheckFinding[] {
  if (!input.definition) return [{ key: 'unit-check.definition-not-loaded' }];
  if (!input.definition.hasDefinition) return [{ key: 'unit-check.no-definition' }];
  const definitionType = input.definition.definitionType;
  // without the lists, what the player says it reads is not known: no finding would pass for a pass.
  // A unit that names no format is not asked, lists or not.
  if (!input.installed && input.modules?.player && definitionType) {
    return [{ key: 'unit-check.definition-type-not-checked' }];
  }
  const player = installedModule(input.modules?.player, input.installed?.player);
  if (player && playerRejectsDefinitionType(definitionType, player)) {
    return [{
      key: 'workspace.definition-type-incompatible',
      params: { player: player.nameAndVersion, definitionType: definitionType || '' }
    }];
  }
  return [];
}

type Checked = Pick<UnitCheckSection, 'findings' | 'variableIdConflicts' | 'info'>;

/** The ids the export would write twice (#2119). */
function checkIdConflicts(input: UnitCheckInput): Checked {
  // without the scheme a conflict cannot be seen, and none found means nothing; the base variables
  // come with it, or from the editor
  if (!input.scheme) return { findings: [{ key: 'unit-check.scheme-not-loaded' }], variableIdConflicts: [] };
  return {
    findings: [],
    variableIdConflicts: findVariableIdConflicts(input.variables, input.scheme.scheme)
  };
}

/** The coding's section, and what the schemer finds that is fixed in the editor. */
interface CheckedScheme {
  schemer: Checked;
  editor: UnitCheckFinding[];
}

function checkScheme(input: UnitCheckInput, editorShown: boolean): CheckedScheme {
  const only = (key: string): CheckedScheme => ({
    schemer: { findings: [{ key }], variableIdConflicts: [] }, editor: []
  });
  if (!input.scheme) return only('unit-check.scheme-not-loaded');
  const idConflicts = checkIdConflicts(input);
  // Without a scheme the schemer finds nothing, but the export writes the base variables all the same:
  // two elements of one internal id are written twice, as the export dialog says (#2119). A unit with
  // nothing to code, an information unit, needs no scheme.
  if (!hasCodingScheme(input.scheme.scheme)) {
    const variableIdConflicts = idConflicts.variableIdConflicts;
    return {
      schemer: needsCoding(input) ?
        { findings: [{ key: 'unit-check.no-scheme' }], variableIdConflicts } :
        { findings: [], variableIdConflicts, info: { key: 'unit-check.nothing-to-code' } },
      editor: []
    };
  }
  // what the schemer finds wrong (#2135), against the variables the schemer is given
  const problems = schemeProblemFindings(
    input.variables,
    // as the next save will store it: an element renamed or deleted in the editor is so in the coding
    input.variables && input.unsaved.variables && !input.unsaved.scheme ?
      schemeWithVariables(input.scheme.scheme, input.variables) :
      input.scheme.scheme,
    editorShown
  );
  return {
    schemer: { ...idConflicts, findings: [...problems.schemer, ...idConflicts.findings] },
    editor: problems.editor
  };
}

/**
 * The state of the unit, tab by tab (#2135): whether its modules are assigned and installed, whether
 * it has content in a format its player reads, whether it has a coding scheme, what the schemer finds
 * wrong with it, and whether the export can write its variables without writing an id twice, and
 * whether it has comments and rich notes. What the schemer finds is asked only where the coding is
 * shown: it is fixed there, and unlike a doubled id it does not stop the export. Where its cause is an
 * element -- two of the same name -- it is named under the editor instead, if shown.
 *
 * A tab the workspace hides gets no section, and its module is not asked for. What the preview and
 * the export need all the same is asked under the properties instead: whether there is content and
 * the player can play it, where the editor is hidden, and whether an id would be written twice,
 * where the coding is -- a scheme may come with an import. Having no scheme is no finding there.
 *
 * What fails nothing -- a unit without its editor -- is a hint, and leaves its section in order. A unit
 * with nothing to code, an information unit, needs neither a scheme nor a schemer.
 */
export function checkUnit(input: UnitCheckInput): UnitCheckSection[] {
  const section = (tab: UnitCheckSection['tab'], checked: Checked): UnitCheckSection => withStatus({
    tab,
    ...checked
  });
  // unit-check.comments-present, unit-check.comments-absent, unit-check.notes-present, unit-check.notes-absent
  const infoSection = (tab: 'comments' | 'notes', present: boolean | undefined): UnitCheckSection => {
    const presence = present ? 'present' : 'absent';
    return section(tab, {
      findings: [],
      variableIdConflicts: [],
      info: { key: present === undefined ? 'unit-check.not-loaded' : `unit-check.${tab}-${presence}` }
    });
  };
  const shown = (tab: UnitCheckSection['tab']) => isTabShown(input.hiddenRoutes, tab);
  const editorFindings = checkEditor(input);
  const idConflicts = shown('schemer') ? undefined : checkIdConflicts(input);
  const scheme = shown('schemer') ? checkScheme(input, shown('editor')) : undefined;
  const sections: UnitCheckSection[] = [
    section('properties', {
      findings: [
        ...checkProperties(input),
        ...(shown('editor') ? [] : editorFindings),
        ...(idConflicts?.findings ?? [])
      ],
      variableIdConflicts: idConflicts?.variableIdConflicts ?? []
    })
  ];
  if (shown('editor')) {
    sections.push(section('editor', {
      findings: [...editorFindings, ...(scheme?.editor ?? [])], variableIdConflicts: []
    }));
  }
  if (scheme) sections.push(section('schemer', scheme.schemer));
  if (shown('comments')) sections.push(infoSection('comments', input.hasComments));
  if (shown('notes')) sections.push(infoSection('notes', input.hasRichNotes));
  return sections;
}

/** A section with how it shows itself, see {@link UnitCheckSection.status}. */
function withStatus(entry: Omit<UnitCheckSection, 'status'>): UnitCheckSection {
  const fails = entry.findings.some(finding => !finding.hint) || entry.variableIdConflicts.length > 0;
  let status: UnitCheckSection['status'] = 'ok';
  if (fails) status = 'warning';
  else if (entry.info || entry.findings.length) status = 'info';
  return { ...entry, status };
}

/**
 * The sections with what is wrong with the key put first under the properties. The key is checked
 * apart from {@link checkUnit}: it changes with every keystroke, and the check parses the scheme.
 */
export function withKeyFindings(sections: UnitCheckSection[], keyFindings: UnitCheckFinding[]): UnitCheckSection[] {
  if (!keyFindings.length) return sections;
  return sections.map(entry => (entry.tab === 'properties' ?
    withStatus({ ...entry, findings: [...keyFindings, ...entry.findings] }) :
    entry));
}
