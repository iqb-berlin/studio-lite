import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({example: 'EL2443'})
  key!: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  groupName?: string;
}
