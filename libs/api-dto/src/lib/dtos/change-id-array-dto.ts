import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IdArrayDto } from './id-array-dto';

export class ChangeIdArrayDto extends IntersectionType(IdArrayDto) {
  @ApiProperty({ example: 1 })
    targetId!: number;
}
