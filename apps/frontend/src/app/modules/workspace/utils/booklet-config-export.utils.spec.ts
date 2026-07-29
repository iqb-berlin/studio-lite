import { BookletConfigDto } from '@studio-lite-lib/api-dto';
import { mapBookletConfigToModernKeys, normalizeLegacyBookletConfig } from './booklet-config-export.utils';

describe('mapBookletConfigToModernKeys', () => {
  it('should produce no entries for empty config', () => {
    expect(mapBookletConfigToModernKeys({})).toHaveLength(0);
  });

  it('should not export controllerDesign', () => {
    const result = mapBookletConfigToModernKeys({ controllerDesign: '2022' } as BookletConfigDto);
    expect(result.map(e => e.key)).not.toContain('controller_design');
  });

  it('should map pagingMode unchanged', () => {
    const result = mapBookletConfigToModernKeys({ pagingMode: 'concat-scroll' });
    expect(result).toContainEqual({ key: 'pagingMode', value: 'concat-scroll' });
  });

  it('should not include pagingMode entry for empty string', () => {
    const result = mapBookletConfigToModernKeys({ pagingMode: '' });
    expect(result.map(e => e.key)).not.toContain('pagingMode');
  });

  it('should map unitScreenHeader OFF to header_content NONE', () => {
    const result = mapBookletConfigToModernKeys({ unitScreenHeader: 'OFF' });
    expect(result).toContainEqual({ key: 'header_content', value: 'NONE' });
    expect(result.map(e => e.key)).not.toContain('header_hidden');
  });

  it('should map unitScreenHeader WITH_BOOKLET_TITLE to header_content BOOKLET_LABEL', () => {
    const result = mapBookletConfigToModernKeys({ unitScreenHeader: 'WITH_BOOKLET_TITLE' });
    expect(result).toContainEqual({ key: 'header_content', value: 'BOOKLET_LABEL' });
    expect(result.map(e => e.key)).not.toContain('header_hidden');
  });

  it('should map unitScreenHeader WITH_UNIT_TITLE to header_content UNIT_LABEL', () => {
    const result = mapBookletConfigToModernKeys({ unitScreenHeader: 'WITH_UNIT_TITLE' });
    expect(result).toContainEqual({ key: 'header_content', value: 'UNIT_LABEL' });
  });

  it('should map unitScreenHeader WITH_BLOCK_TITLE to header_content BLOCK_LABEL', () => {
    const result = mapBookletConfigToModernKeys({ unitScreenHeader: 'WITH_BLOCK_TITLE' });
    expect(result).toContainEqual({ key: 'header_content', value: 'BLOCK_LABEL' });
  });

  it('should map unitScreenHeader EMPTY to header_content NONE', () => {
    const result = mapBookletConfigToModernKeys({ unitScreenHeader: 'EMPTY' });
    expect(result).toContainEqual({ key: 'header_content', value: 'NONE' });
    expect(result.map(e => e.key)).not.toContain('header_hidden');
  });

  it('should map unitTitle ON to toolbar_show_unit_title TRUE', () => {
    expect(mapBookletConfigToModernKeys({ unitTitle: 'ON' }))
      .toContainEqual({ key: 'toolbar_show_unit_title', value: 'TRUE' });
  });

  it('should map unitTitle OFF to toolbar_show_unit_title FALSE', () => {
    expect(mapBookletConfigToModernKeys({ unitTitle: 'OFF' }))
      .toContainEqual({ key: 'toolbar_show_unit_title', value: 'FALSE' });
  });

  it('should map unitNaviButtons OFF to HIDDEN label and controls hidden', () => {
    const result = mapBookletConfigToModernKeys({ unitNaviButtons: 'OFF' });
    expect(result).toContainEqual({ key: 'navbar_unit_label', value: 'HIDDEN' });
    expect(result).toContainEqual({ key: 'navbar_unit_controls_hidden', value: 'TRUE' });
  });

  it('should map unitNaviButtons ARROWS_ONLY to INDEX label, controls visible, unit list hidden', () => {
    const result = mapBookletConfigToModernKeys({ unitNaviButtons: 'ARROWS_ONLY' });
    expect(result).toContainEqual({ key: 'navbar_unit_label', value: 'INDEX' });
    expect(result).toContainEqual({ key: 'navbar_unit_controls_hidden', value: 'FALSE' });
    expect(result).toContainEqual({ key: 'toolbar_show_unit_list', value: 'FALSE' });
  });

  it('should map unitNaviButtons FULL to INDEX label, controls visible, unit list visible', () => {
    const result = mapBookletConfigToModernKeys({ unitNaviButtons: 'FULL' });
    expect(result).toContainEqual({ key: 'navbar_unit_label', value: 'INDEX' });
    expect(result).toContainEqual({ key: 'navbar_unit_controls_hidden', value: 'FALSE' });
    expect(result).toContainEqual({ key: 'toolbar_show_unit_list', value: 'TRUE' });
  });

  it('should map pageNaviButtons OFF to page label HIDDEN and controls hidden', () => {
    const result = mapBookletConfigToModernKeys({ pageNaviButtons: 'OFF' });
    expect(result).toContainEqual({ key: 'navbar_page_label', value: 'HIDDEN' });
    expect(result).toContainEqual({ key: 'navbar_page_controls_hidden', value: 'TRUE' });
  });

  it('should map pageNaviButtons SEPARATE_BOTTOM to page label LIST and controls visible', () => {
    const result = mapBookletConfigToModernKeys({ pageNaviButtons: 'SEPARATE_BOTTOM' });
    expect(result).toContainEqual({ key: 'navbar_page_label', value: 'LIST' });
    expect(result).toContainEqual({ key: 'navbar_page_controls_hidden', value: 'FALSE' });
  });

  it('should map navbarUnitLabel directly to navbar_unit_label', () => {
    expect(mapBookletConfigToModernKeys({ navbarUnitLabel: 'LABEL' }))
      .toContainEqual({ key: 'navbar_unit_label', value: 'LABEL' });
  });

  it('should map navbarBackwardButton to navbar_backward_button', () => {
    expect(mapBookletConfigToModernKeys({ navbarBackwardButton: 'DYNAMIC' }))
      .toContainEqual({ key: 'navbar_backward_button', value: 'DYNAMIC' });
  });

  it('should map silentMode to silent_mode', () => {
    expect(mapBookletConfigToModernKeys({ silentMode: 'TRUE' }))
      .toContainEqual({ key: 'silent_mode', value: 'TRUE' });
  });

  it('should map forcePresentationComplete to force_presentation_complete', () => {
    expect(mapBookletConfigToModernKeys({ forcePresentationComplete: 'ALWAYS' }))
      .toContainEqual({ key: 'force_presentation_complete', value: 'ALWAYS' });
  });

  it('should not include new fields that are undefined', () => {
    const result = mapBookletConfigToModernKeys({ navbarUnitLabel: undefined, silentMode: undefined });
    expect(result.map(e => e.key)).not.toContain('navbar_unit_label');
    expect(result.map(e => e.key)).not.toContain('silent_mode');
  });

  it('should map navbarUnitControlsHidden to navbar_unit_controls_hidden', () => {
    expect(mapBookletConfigToModernKeys({ navbarUnitControlsHidden: 'TRUE' }))
      .toContainEqual({ key: 'navbar_unit_controls_hidden', value: 'TRUE' });
  });

  it('should map navbarPageLabel to navbar_page_label', () => {
    expect(mapBookletConfigToModernKeys({ navbarPageLabel: 'LIST' }))
      .toContainEqual({ key: 'navbar_page_label', value: 'LIST' });
  });

  it('should map navbarPageControlsHidden to navbar_page_controls_hidden', () => {
    expect(mapBookletConfigToModernKeys({ navbarPageControlsHidden: 'FALSE' }))
      .toContainEqual({ key: 'navbar_page_controls_hidden', value: 'FALSE' });
  });

  it('should map navbarForwardButton to navbar_forward_button', () => {
    expect(mapBookletConfigToModernKeys({ navbarForwardButton: 'UNITS' }))
      .toContainEqual({ key: 'navbar_forward_button', value: 'UNITS' });
  });

  it('should map toolbarShowUnitTitle to toolbar_show_unit_title', () => {
    expect(mapBookletConfigToModernKeys({ toolbarShowUnitTitle: 'TRUE' }))
      .toContainEqual({ key: 'toolbar_show_unit_title', value: 'TRUE' });
  });

  it('should map toolbarShowUnitList to toolbar_show_unit_list', () => {
    expect(mapBookletConfigToModernKeys({ toolbarShowUnitList: 'TRUE' }))
      .toContainEqual({ key: 'toolbar_show_unit_list', value: 'TRUE' });
  });

  it('should map toolbarShowFullscreenButton to toolbar_show_fullscreen_button', () => {
    expect(mapBookletConfigToModernKeys({ toolbarShowFullscreenButton: 'TRUE' }))
      .toContainEqual({ key: 'toolbar_show_fullscreen_button', value: 'TRUE' });
  });

  it('should map toolbarShowReloadButton to toolbar_show_reload_button', () => {
    expect(mapBookletConfigToModernKeys({ toolbarShowReloadButton: 'FALSE' }))
      .toContainEqual({ key: 'toolbar_show_reload_button', value: 'FALSE' });
  });

  it('should map toolbarShowTimeLeft to toolbar_show_time_left', () => {
    expect(mapBookletConfigToModernKeys({ toolbarShowTimeLeft: 'TRUE' }))
      .toContainEqual({ key: 'toolbar_show_time_left', value: 'TRUE' });
  });

  it('should map browserBehaviour to browserBehaviour key', () => {
    expect(mapBookletConfigToModernKeys({ browserBehaviour: 'preventNav' }))
      .toContainEqual({ key: 'browserBehaviour', value: 'preventNav' });
  });

  it('should map forceResponseComplete to force_response_complete', () => {
    expect(mapBookletConfigToModernKeys({ forceResponseComplete: 'ALWAYS' }))
      .toContainEqual({ key: 'force_response_complete', value: 'ALWAYS' });
  });

  it('should deduplicate: new direct field wins over legacy-derived entry for same key', () => {
    const result = mapBookletConfigToModernKeys({
      unitNaviButtons: 'FULL',
      navbarUnitLabel: 'LABEL'
    });
    const navbarUnitLabelEntries = result.filter(e => e.key === 'navbar_unit_label');
    expect(navbarUnitLabelEntries).toHaveLength(1);
    expect(navbarUnitLabelEntries[0].value).toBe('LABEL');
  });

  it('should deduplicate: new toolbarShowUnitTitle wins over legacy unitTitle', () => {
    const result = mapBookletConfigToModernKeys({ unitTitle: 'OFF', toolbarShowUnitTitle: 'TRUE' });
    const entries = result.filter(e => e.key === 'toolbar_show_unit_title');
    expect(entries).toHaveLength(1);
    expect(entries[0].value).toBe('TRUE');
  });

  it('should combine multiple fields correctly', () => {
    const config: BookletConfigDto = {
      pagingMode: 'separate',
      unitScreenHeader: 'WITH_BOOKLET_TITLE',
      unitTitle: 'ON',
      unitNaviButtons: 'FULL',
      pageNaviButtons: 'SEPARATE_BOTTOM',
      controllerDesign: '2022'
    };
    const result = mapBookletConfigToModernKeys(config);
    const keys = result.map(e => e.key);
    expect(keys).toContain('pagingMode');
    expect(keys).toContain('header_content');
    expect(keys).not.toContain('header_hidden');
    expect(keys).toContain('toolbar_show_unit_title');
    expect(keys).toContain('navbar_unit_label');
    expect(keys).toContain('navbar_unit_controls_hidden');
    expect(keys).toContain('toolbar_show_unit_list');
    expect(keys).toContain('navbar_page_label');
    expect(keys).toContain('navbar_page_controls_hidden');
    expect(keys).not.toContain('controller_design');
  });
});

describe('normalizeLegacyBookletConfig', () => {
  it('should return empty object unchanged', () => {
    expect(normalizeLegacyBookletConfig({})).toEqual({});
  });

  it('should not mutate the input object', () => {
    const input: BookletConfigDto = { unitScreenHeader: 'WITH_UNIT_TITLE', unitTitle: 'ON', controllerDesign: '2022' };
    normalizeLegacyBookletConfig(input);
    expect(input).toEqual({ unitScreenHeader: 'WITH_UNIT_TITLE', unitTitle: 'ON', controllerDesign: '2022' });
  });

  it('should pass through modern fields unchanged', () => {
    const config: BookletConfigDto = { pagingMode: 'separate', loadingMode: 'LAZY' };
    expect(normalizeLegacyBookletConfig(config)).toEqual(config);
  });

  it('should remove controllerDesign', () => {
    const result = normalizeLegacyBookletConfig({ controllerDesign: '2022' } as BookletConfigDto);
    expect(result).not.toHaveProperty('controllerDesign');
  });

  it('should map unitScreenHeader to headerContent and remove it', () => {
    const result = normalizeLegacyBookletConfig({ unitScreenHeader: 'WITH_BOOKLET_TITLE' });
    expect(result.headerContent).toBe('BOOKLET_LABEL');
    expect(result).not.toHaveProperty('unitScreenHeader');
  });

  it('should map unitScreenHeader OFF to headerContent NONE', () => {
    const result = normalizeLegacyBookletConfig({ unitScreenHeader: 'OFF' });
    expect(result.headerContent).toBe('NONE');
  });

  it('should not overwrite existing headerContent', () => {
    const result = normalizeLegacyBookletConfig(
      { unitScreenHeader: 'WITH_UNIT_TITLE', headerContent: 'BOOKLET_LABEL' }
    );
    expect(result.headerContent).toBe('BOOKLET_LABEL');
    expect(result).not.toHaveProperty('unitScreenHeader');
  });

  it('should map unitTitle ON to toolbarShowUnitTitle TRUE and remove it', () => {
    const result = normalizeLegacyBookletConfig({ unitTitle: 'ON' });
    expect(result.toolbarShowUnitTitle).toBe('TRUE');
    expect(result).not.toHaveProperty('unitTitle');
  });

  it('should map unitTitle OFF to toolbarShowUnitTitle FALSE', () => {
    const result = normalizeLegacyBookletConfig({ unitTitle: 'OFF' });
    expect(result.toolbarShowUnitTitle).toBe('FALSE');
  });

  it('should not overwrite existing toolbarShowUnitTitle', () => {
    const result = normalizeLegacyBookletConfig({ unitTitle: 'OFF', toolbarShowUnitTitle: 'TRUE' });
    expect(result.toolbarShowUnitTitle).toBe('TRUE');
  });

  it('should map unitNaviButtons OFF to navbarUnitLabel HIDDEN', () => {
    const result = normalizeLegacyBookletConfig({ unitNaviButtons: 'OFF' });
    expect(result.navbarUnitLabel).toBe('HIDDEN');
    expect(result.navbarUnitControlsHidden).toBe('TRUE');
    expect(result).not.toHaveProperty('unitNaviButtons');
  });

  it('should map unitNaviButtons ARROWS_ONLY correctly', () => {
    const result = normalizeLegacyBookletConfig({ unitNaviButtons: 'ARROWS_ONLY' });
    expect(result.navbarUnitLabel).toBe('INDEX');
    expect(result.navbarUnitControlsHidden).toBe('FALSE');
    expect(result.toolbarShowUnitList).toBe('FALSE');
  });

  it('should map unitNaviButtons FULL correctly', () => {
    const result = normalizeLegacyBookletConfig({ unitNaviButtons: 'FULL' });
    expect(result.navbarUnitLabel).toBe('INDEX');
    expect(result.navbarUnitControlsHidden).toBe('FALSE');
    expect(result.toolbarShowUnitList).toBe('TRUE');
  });

  it('should not overwrite existing navbarUnitLabel', () => {
    const result = normalizeLegacyBookletConfig({ unitNaviButtons: 'FULL', navbarUnitLabel: 'LABEL' });
    expect(result.navbarUnitLabel).toBe('LABEL');
  });

  it('should map pageNaviButtons OFF correctly', () => {
    const result = normalizeLegacyBookletConfig({ pageNaviButtons: 'OFF' });
    expect(result.navbarPageLabel).toBe('HIDDEN');
    expect(result.navbarPageControlsHidden).toBe('TRUE');
    expect(result).not.toHaveProperty('pageNaviButtons');
  });

  it('should map pageNaviButtons SEPARATE_BOTTOM correctly', () => {
    const result = normalizeLegacyBookletConfig({ pageNaviButtons: 'SEPARATE_BOTTOM' });
    expect(result.navbarPageLabel).toBe('LIST');
    expect(result.navbarPageControlsHidden).toBe('FALSE');
  });

  it('should not overwrite existing navbarPageLabel', () => {
    const result = normalizeLegacyBookletConfig({ pageNaviButtons: 'SEPARATE_BOTTOM', navbarPageLabel: 'INDEX' });
    expect(result.navbarPageLabel).toBe('INDEX');
  });

  it('should handle full legacy review config', () => {
    const reviewConfig: BookletConfigDto = {
      pagingMode: 'separate',
      pageNaviButtons: 'SEPARATE_BOTTOM',
      unitNaviButtons: 'FULL',
      controllerDesign: '2022',
      unitScreenHeader: 'WITH_BOOKLET_TITLE',
      unitTitle: 'ON'
    };
    const result = normalizeLegacyBookletConfig(reviewConfig);
    expect(result.pagingMode).toBe('separate');
    expect(result.headerContent).toBe('BOOKLET_LABEL');
    expect(result.toolbarShowUnitTitle).toBe('TRUE');
    expect(result.navbarUnitLabel).toBe('INDEX');
    expect(result.toolbarShowUnitList).toBe('TRUE');
    expect(result.navbarPageLabel).toBe('LIST');
    expect(result).not.toHaveProperty('unitScreenHeader');
    expect(result).not.toHaveProperty('unitTitle');
    expect(result).not.toHaveProperty('unitNaviButtons');
    expect(result).not.toHaveProperty('pageNaviButtons');
    expect(result).not.toHaveProperty('controllerDesign');
  });
});
