import { ApiProperty } from '@nestjs/swagger';

export class UnitExportConfigDto {
  @ApiProperty()
  unitXsdUrl = 'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/master/definitions/vo_Unit.xsd';

  @ApiProperty()
  bookletXsdUrl = 'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/master/definitions/vo_Booklet.xsd';

  @ApiProperty()
  testTakersXsdUrl = 'https://raw.githubusercontent.com/iqb-berlin/testcenter-backend/master/definitions/vo_Testtakers.xsd';
}
