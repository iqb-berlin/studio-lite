import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IdArrayDto } from '@studio-lite-lib/api-dto';

export class CopyUnitDto extends IntersectionType(
  IdArrayDto
) {
  @ApiProperty({ example: true })
    addComments!: boolean;
}
