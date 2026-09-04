import { BookletConfigDto, UnitDownloadBookletSettingsDto } from '@studio-lite-lib/api-dto';

/** Which header content each of the retired `unitScreenHeader` values stood for. */
const unitScreenHeaderToContentMap: Record<string, string> = {
  OFF: 'NONE',
  WITH_UNIT_TITLE: 'UNIT_LABEL',
  WITH_BOOKLET_TITLE: 'BOOKLET_LABEL',
  WITH_BLOCK_TITLE: 'BLOCK_LABEL',
  EMPTY: 'NONE'
};

/**
 * Rewrites a stored booklet configuration into the keys the current testcenter understands. The
 * older keys said in one value what is now split over several -- a navigation setting decides both
 * what the navbar shows and whether its controls are there -- so each of them is translated into
 * the whole set it stood for and then dropped.
 *
 * A key that is already there is never overwritten: what was configured deliberately wins over what
 * a legacy value implies.
 */
export function normalizeLegacyBookletConfig(config: BookletConfigDto): BookletConfigDto {
  const result: BookletConfigDto = { ...config };

  if (result.unitScreenHeader) {
    if (!result.headerContent) {
      const mapped = unitScreenHeaderToContentMap[result.unitScreenHeader];
      if (mapped) result.headerContent = mapped;
    }
    delete result.unitScreenHeader;
  }

  if (result.unitTitle) {
    if (!result.toolbarShowUnitTitle) {
      result.toolbarShowUnitTitle = result.unitTitle === 'ON' ? 'TRUE' : 'FALSE';
    }
    delete result.unitTitle;
  }

  if (result.unitNaviButtons) {
    if (!result.navbarUnitLabel) {
      if (result.unitNaviButtons === 'OFF') {
        result.navbarUnitLabel = 'HIDDEN';
        result.navbarUnitControlsHidden ??= 'TRUE';
      } else if (result.unitNaviButtons === 'ARROWS_ONLY') {
        result.navbarUnitLabel = 'INDEX';
        result.navbarUnitControlsHidden ??= 'FALSE';
        result.toolbarShowUnitList ??= 'FALSE';
      } else if (result.unitNaviButtons === 'FULL') {
        result.navbarUnitLabel = 'INDEX';
        result.navbarUnitControlsHidden ??= 'FALSE';
        result.toolbarShowUnitList ??= 'TRUE';
      }
    }
    delete result.unitNaviButtons;
  }

  if (result.pageNaviButtons) {
    if (!result.navbarPageLabel) {
      if (result.pageNaviButtons === 'OFF') {
        result.navbarPageLabel = 'HIDDEN';
        result.navbarPageControlsHidden ??= 'TRUE';
      } else if (result.pageNaviButtons === 'SEPARATE_BOTTOM') {
        result.navbarPageLabel = 'LIST';
        result.navbarPageControlsHidden ??= 'FALSE';
      }
    }
    delete result.pageNaviButtons;
  }

  delete result.controllerDesign;

  return result;
}

/**
 * The booklet configuration as the key/value pairs an exported booklet carries, in the snake_case
 * spelling the testcenter reads. Legacy keys contribute the whole set they stand for; a key that
 * several sources produce is kept once, with the last contribution winning.
 */
export function mapBookletConfigToModernKeys(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  const all = [
    ...pagingModeEntries(config),
    ...headerEntries(config),
    ...unitTitleEntries(config),
    ...unitNaviEntries(config),
    ...pageNaviEntries(config),
    ...directStringEntries(config)
  ];
  const deduped = new Map<string, string>(all.map(({ key, value }) => [key, value]));
  return [...deduped.entries()].map(([key, value]) => ({ key, value }));
}

/** How a unit is paged, taken over as it stands. */
function pagingModeEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (!config.pagingMode) return [];
  return [{ key: 'pagingMode', value: config.pagingMode }];
}

/** The header, from the retired `unitScreenHeader` value; an unknown value contributes nothing. */
function headerEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (!config.unitScreenHeader) return [];
  const content = unitScreenHeaderToContentMap[config.unitScreenHeader];
  if (!content) return [];
  return [{ key: 'header_content', value: content }];
}

/** Whether the toolbar shows the unit's title, from the retired on/off switch. */
function unitTitleEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (config.unitTitle === 'ON') return [{ key: 'toolbar_show_unit_title', value: 'TRUE' }];
  if (config.unitTitle === 'OFF') return [{ key: 'toolbar_show_unit_title', value: 'FALSE' }];
  return [];
}

/**
 * The unit navigation, from the retired three-way switch: each of its values decides the navbar's
 * label, whether its controls are shown, and -- for the two that offer a list -- the toolbar's unit
 * list as well.
 */
function unitNaviEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (config.unitNaviButtons === 'OFF') {
    return [
      { key: 'navbar_unit_label', value: 'HIDDEN' },
      { key: 'navbar_unit_controls_hidden', value: 'TRUE' }
    ];
  }
  if (config.unitNaviButtons === 'ARROWS_ONLY') {
    return [
      { key: 'navbar_unit_label', value: 'INDEX' },
      { key: 'navbar_unit_controls_hidden', value: 'FALSE' },
      { key: 'toolbar_show_unit_list', value: 'FALSE' }
    ];
  }
  if (config.unitNaviButtons === 'FULL') {
    return [
      { key: 'navbar_unit_label', value: 'INDEX' },
      { key: 'navbar_unit_controls_hidden', value: 'FALSE' },
      { key: 'toolbar_show_unit_list', value: 'TRUE' }
    ];
  }
  return [];
}

/** The page navigation, from the retired switch -- the same arrangement as {@link unitNaviEntries}. */
function pageNaviEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (config.pageNaviButtons === 'OFF') {
    return [
      { key: 'navbar_page_label', value: 'HIDDEN' },
      { key: 'navbar_page_controls_hidden', value: 'TRUE' }
    ];
  }
  if (config.pageNaviButtons === 'SEPARATE_BOTTOM') {
    return [
      { key: 'navbar_page_label', value: 'LIST' },
      { key: 'navbar_page_controls_hidden', value: 'FALSE' }
    ];
  }
  return [];
}

/**
 * The settings that only need renaming: the studio's camelCase field on the left, the testcenter's
 * key on the right. `logPolicy` is the exception the testcenter spells in camelCase itself.
 */
const directKeyMap: Partial<Record<keyof BookletConfigDto, string>> = {
  loadingMode: 'loading_mode',
  logPolicy: 'logPolicy',
  restoreCurrentPageOnReturn: 'restore_current_page_on_return',
  lockTestOnTermination: 'lock_test_on_termination',
  askForFullscreen: 'ask_for_fullscreen',
  unitTimeLeftWarnings: 'unit_time_left_warnings',
  unitResponsesBufferTime: 'unit_responses_buffer_time',
  unitStateBufferTime: 'unit_state_buffer_time',
  testStateBufferTime: 'test_state_buffer_time',
  headerContent: 'header_content',
  navbarUnitLabel: 'navbar_unit_label',
  navbarUnitControlsHidden: 'navbar_unit_controls_hidden',
  navbarPageLabel: 'navbar_page_label',
  navbarPageControlsHidden: 'navbar_page_controls_hidden',
  navbarBackwardButton: 'navbar_backward_button',
  navbarForwardButton: 'navbar_forward_button',
  toolbarShowUnitTitle: 'toolbar_show_unit_title',
  toolbarShowUnitList: 'toolbar_show_unit_list',
  toolbarShowFullscreenButton: 'toolbar_show_fullscreen_button',
  toolbarShowReloadButton: 'toolbar_show_reload_button',
  toolbarShowTimeLeft: 'toolbar_show_time_left',
  silentMode: 'silent_mode',
  browserBehaviour: 'browserBehaviour',
  forcePresentationComplete: 'force_presentation_complete',
  forceResponseComplete: 'force_response_complete'
};

/** Everything in {@link directKeyMap} that is actually set, renamed and handed on unchanged. */
function directStringEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  return (Object.keys(directKeyMap) as (keyof BookletConfigDto)[])
    .filter(field => !!config[field])
    .map(field => ({ key: directKeyMap[field] as string, value: config[field] as string }));
}
