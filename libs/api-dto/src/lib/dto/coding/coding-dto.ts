// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';

export class CodebookUnitDto {
  @ApiProperty()
    key!: string;

  @ApiProperty()
    name!: string;

  @ApiProperty()
    variables?: CodeBookVariable[];

  @ApiProperty()
    missings?: Missing[];
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
    score?: string;

  @ApiProperty()
    scoreLabel!: string;

  @ApiProperty()
    description!: string;
}

export class CodeBookContentSetting {
  @ApiProperty()
    exportFormat!: 'json' | 'docx';

  @ApiProperty()
    missingsProfile!: string;

  @ApiProperty()
    hasClosedVars!: boolean;

  @ApiProperty()
    hasOnlyManualCoding!: boolean;

  @ApiProperty()
    hasDerivedVars!: boolean;

  @ApiProperty()
    hasGeneralInstructions!: boolean;

  @ApiProperty()
    codeLabelToUpper!: boolean;

  @ApiProperty()
    showScore!: boolean;
}

export class Missing {
  @ApiProperty()
    id!: string;

  @ApiProperty()
    label!: string;

  @ApiProperty()
    description!: string;

  @ApiProperty()
    code!: number;
}
