import { BookletConfigDto, UnitDownloadBookletSettingsDto } from '@studio-lite-lib/api-dto';

const headerContentMap: Record<string, string> = {
  WITH_UNIT_TITLE: 'UNIT_LABEL',
  WITH_BOOKLET_TITLE: 'BOOKLET_LABEL',
  WITH_BLOCK_TITLE: 'BLOCK_LABEL',
  EMPTY: 'NONE'
};

export function mapBookletConfigToModernKeys(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  return [
    ...pagingModeEntries(config),
    ...headerEntries(config),
    ...unitTitleEntries(config),
    ...unitNaviEntries(config),
    ...pageNaviEntries(config)
  ];
}

function pagingModeEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (!config.pagingMode) return [];
  return [{ key: 'pagingMode', value: config.pagingMode }];
}

function headerEntries(config: BookletConfigDto): UnitDownloadBookletSettingsDto[] {
  if (!config.unitScreenHeader) return [];
  if (config.unitScreenHeader === 'OFF') return [{ key: 'header_hidden', value: 'TRUE' }];
  const content = headerContentMap[config.unitScreenHeader];
  if (!content) return [];
  return [
    { key: 'header_hidden', value: 'FALSE' },
    { key: 'header_content', value: content }
  ];
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
