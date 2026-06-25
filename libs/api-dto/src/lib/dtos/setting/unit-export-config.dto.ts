import { ApiProperty } from '@nestjs/swagger';

export class UnitExportConfigDto {
  @ApiProperty()
    unitXsdUrl =
      'https://github.com/iqb-berlin/testcenter/blob/master/definitions/vo_Unit.xsd';

  @ApiProperty()
    bookletXsdUrl =
      'https://w3id.org/iqb/spec/testcenter-booklet-xml/18.0';

  @ApiProperty()
    testTakersXsdUrl =
      'https://w3id.org/iqb/spec/testcenter-testtaker-xml/18.0';
}
