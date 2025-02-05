import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ChangeIdArrayDto } from '@studio-lite-lib/api-dto';

export class CopyUnitDto extends IntersectionType(
  ChangeIdArrayDto
) {
  @ApiProperty({ example: true })
    addComments!: boolean;
}
