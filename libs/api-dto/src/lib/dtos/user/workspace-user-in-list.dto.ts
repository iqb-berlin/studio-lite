import { ApiProperty } from '@nestjs/swagger';
import { UserInListDto } from './user-in-list.dto';

export class WorkspaceUserInListDto extends UserInListDto {
  @ApiProperty()
  workspaceAccessLevel!: number;
}
