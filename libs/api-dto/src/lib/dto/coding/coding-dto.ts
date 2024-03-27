import { ApiProperty } from '@nestjs/swagger';

export class CodebookUnit {
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

export class CodeBookMissing {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;
}

export class MissingsProfilesDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  label?: string;

  @ApiProperty()
  missings?: CodeBookMissing[];
}
