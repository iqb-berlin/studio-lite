import { BookletConfigDto, UnitDownloadBookletSettingsDto } from '@studio-lite-lib/api-dto';

const unitScreenHeaderToContentMap: Record<string, string> = {
  OFF: 'NONE',
  WITH_UNIT_TITLE: 'UNIT_LABEL',
  WITH_BOOKLET_TITLE: 'BOOKLET_LABEL',
  WITH_BLOCK_TITLE: 'BLOCK_LABEL',
  EMPTY: 'NONE'
};

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

function pagingModeEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (!config.pagingMode) return [];
  return [{ key: 'pagingMode', value: config.pagingMode }];
}

function headerEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (!config.unitScreenHeader) return [];
  const content = unitScreenHeaderToContentMap[config.unitScreenHeader];
  if (!content) return [];
  return [{ key: 'header_content', value: content }];
}

function unitTitleEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (config.unitTitle === 'ON') return [{ key: 'toolbar_show_unit_title', value: 'TRUE' }];
  if (config.unitTitle === 'OFF') return [{ key: 'toolbar_show_unit_title', value: 'FALSE' }];
  return [];
}

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

function directStringEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  return (Object.keys(directKeyMap) as (keyof BookletConfigDto)[])
    .filter(field => !!config[field])
    .map(field => ({ key: directKeyMap[field] as string, value: config[field] as string }));
}
