import { ApiProperty } from '@nestjs/swagger';

export class GroupNameDto {
  @ApiProperty({ example: 'name' })
    groupName!: string;
}
