import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { MoveToDto } from '@studio-lite-lib/api-dto';

export class CopyUnitDto extends IntersectionType(
  MoveToDto
) {
  @ApiProperty({ example: true })
    addComments!: boolean;
}
