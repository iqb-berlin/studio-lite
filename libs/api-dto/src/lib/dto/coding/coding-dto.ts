// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class CodebookDto {
  @ApiProperty()
    key!: string;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    variables?: CodeBookVariable[];
}

export class CodeBookVariable {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    label!: string;

  @ApiProperty()
    generalInstruction!: string;

  @ApiProperty()
    codes!: CodeBookCode[];
}

export class CodeBookCode {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    label!: string;

  @ApiProperty()
    score!: string;

  @ApiProperty()
    scoreLabel!: string;

  @ApiProperty()
    description!: string;
}

export class CodeBookContentSetting {
  @ApiProperty()
    exportFormat!: 'json' | 'docx';

  @ApiProperty()
    hasClosedVars!: string;

  @ApiProperty()
    hasOnlyManualCoding!: string;

  @ApiProperty()
    hasDerivedVars!: string;

  @ApiProperty()
    hasGeneralInstructions!: string;
}
