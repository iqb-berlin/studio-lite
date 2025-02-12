import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { GroupNameDto } from './group-name-dto';

export class RenameGroupNameDto extends IntersectionType(GroupNameDto) {
  @ApiProperty({ example: 'name' })
    newGroupName!: string;
}
