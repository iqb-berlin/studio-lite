import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IdArrayDto } from './id-array-dto';

export class NewNameDto extends IntersectionType(IdArrayDto) {
  @ApiProperty({ example: 'neu' })
    name!: string;
}
