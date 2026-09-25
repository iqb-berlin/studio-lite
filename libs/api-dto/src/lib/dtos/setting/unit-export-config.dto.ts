import { ApiProperty } from '@nestjs/swagger';

export class UnitExportConfigDto {
  @ApiProperty()
    unitXsdUrl =
      'https://w3id.org/iqb/spec/unit-xml/17.6';

  @ApiProperty()
    bookletXsdUrl =
      'https://w3id.org/iqb/spec/testcenter-booklet-xml/18.0';

  @ApiProperty()
    testTakersXsdUrl =
      'https://w3id.org/iqb/spec/testcenter-testtaker-xml/18.0';
}
