import { ApiProperty } from '@nestjs/swagger';

export class BookletConfigDto {
  @ApiProperty({
    examples: ['separate', 'buttons', 'concat-scroll', 'concat-scroll-snap']
  })
    pagingMode? = 'separate';

  @ApiProperty({
    examples: ['OFF', 'SEPARATE_BOTTOM'],
    deprecated: true
  })
    pageNaviButtons? = 'SEPARATE_BOTTOM';

  @ApiProperty({
    examples: ['OFF', 'ARROWS_ONLY', 'FULL'],
    deprecated: true
  })
    unitNaviButtons? = 'FULL';

  @ApiProperty({
    examples: ['2018', '2022']
  })
    controllerDesign? = '2022';

  @ApiProperty({
    examples: ['OFF', 'WITH_UNIT_TITLE', 'WITH_BOOKLET_TITLE', 'WITH_BLOCK_TITLE', 'EMPTY'],
    deprecated: true
  })
    unitScreenHeader? = 'WITH_BOOKLET_TITLE';

  @ApiProperty({
    examples: ['OFF', 'ON'],
    deprecated: true
  })
    unitTitle? = 'ON';

  @ApiProperty({ examples: ['LAZY', 'EAGER'] })
    loadingMode?: string;

  @ApiProperty({ examples: ['disabled', 'lean', 'rich', 'debug'] })
    logPolicy?: string;

  @ApiProperty({ examples: ['OFF', 'ON'] })
    restoreCurrentPageOnReturn?: string;

  @ApiProperty({ examples: ['ON', 'OFF'] })
    lockTestOnTermination?: string;

  @ApiProperty({ examples: ['ON', 'OFF'] })
    askForFullscreen?: string;

  @ApiProperty({ description: 'Comma-separated minutes, e.g. 5,1' })
    unitTimeLeftWarnings?: string;

  @ApiProperty({ description: 'Milliseconds' })
    unitResponsesBufferTime?: string;

  @ApiProperty({ description: 'Milliseconds' })
    unitStateBufferTime?: string;

  @ApiProperty({ description: 'Milliseconds' })
    testStateBufferTime?: string;

  @ApiProperty({ examples: ['NONE', 'BOOKLET_LABEL', 'BLOCK_LABEL', 'UNIT_LABEL'] })
    headerContent?: string;

  @ApiProperty({ examples: ['HIDDEN', 'INDEX', 'LABEL'] })
    navbarUnitLabel?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    navbarUnitControlsHidden?: string;

  @ApiProperty({ examples: ['HIDDEN', 'INDEX', 'LABEL', 'LIST'] })
    navbarPageLabel?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    navbarPageControlsHidden?: string;

  @ApiProperty({ examples: ['HIDDEN', 'DYNAMIC', 'UNITS', 'PAGES'] })
    navbarBackwardButton?: string;

  @ApiProperty({ examples: ['HIDDEN', 'DYNAMIC', 'UNITS', 'PAGES'] })
    navbarForwardButton?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    toolbarShowUnitTitle?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    toolbarShowUnitList?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    toolbarShowFullscreenButton?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    toolbarShowReloadButton?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    toolbarShowTimeLeft?: string;

  @ApiProperty({ examples: ['FALSE', 'TRUE'] })
    silentMode?: string;

  @ApiProperty({ examples: ['standard', 'preventNav'] })
    browserBehaviour?: string;

  @ApiProperty({ examples: ['OFF', 'ON', 'ALWAYS'] })
    forcePresentationComplete?: string;

  @ApiProperty({ examples: ['OFF', 'ON', 'ALWAYS'] })
    forceResponseComplete?: string;
}
