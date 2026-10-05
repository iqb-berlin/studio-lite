// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import type {
  CodeBookContentSetting as SharedCodebookOptions
} from '@iqb/ngx-coding-components/codebook-models';
import { ItemsMetadataValues } from '../unit/profile-metadata-values.class';

export class CodebookUnitDto {
  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  variables?: CodeBookVariable[];

  @ApiProperty()
  missings?: Missing[];

  @ApiProperty()
  items?: ItemsMetadataValues[];
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
  description!: string;
}

export class CodeBookContentSetting implements SharedCodebookOptions {
  @ApiProperty({ required: false, enum: ['all', 'required', 'not-required'], default: 'all' })
  trainingRequirement?: SharedCodebookOptions['trainingRequirement'];

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

  @ApiProperty()
  hideItemVarRelation!: boolean;

  @ApiProperty()
  hasOnlyVarsWithCodes!: boolean;
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
