import { ApiProperty } from '@nestjs/swagger';

export class UnitExportConfigDto {
  @ApiProperty()
    unitXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd';

  @ApiProperty()
    bookletXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Booklet.xsd';

  @ApiProperty()
    testTakersXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Testtakers.xsd';
}
