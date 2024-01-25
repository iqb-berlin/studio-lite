import { ApiProperty } from '@nestjs/swagger';

export class BookletConfigDto {
  @ApiProperty({
    examples: ['separate', 'buttons', 'concat-scroll', 'concat-scroll-snap']
  })
    pagingMode? = 'separate';

  @ApiProperty({
    examples: ['OFF', 'SEPARATE_BOTTOM']
  })
    pageNaviButtons? = 'SEPARATE_BOTTOM';

  @ApiProperty({
    examples: ['OFF', 'ARROWS_ONLY', 'FULL']
  })
    unitNaviButtons? = 'FULL';

  @ApiProperty({
    examples: ['2018', '2022']
  })
    controllerDesign? = '2022';

  @ApiProperty({
    examples: ['OFF', 'WITH_UNIT_TITLE', 'WITH_BOOKLET_TITLE', 'WITH_BLOCK_TITLE', 'EMPTY']
  })
    unitScreenHeader? = 'WITH_BOOKLET_TITLE';

  @ApiProperty({
    examples: ['OFF', 'ON']
  })
    unitTitle? = 'ON';
}
