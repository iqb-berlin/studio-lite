import { ApiProperty } from '@nestjs/swagger';
import { UserInListDto } from '@studio-lite-lib/api-dto';

export class UsersInWorkspaceDto {
  @ApiProperty()
    users!: UserInListDto[];

  @ApiProperty()
    workspaceGroupAdmins!: UserInListDto[];

  @ApiProperty()
    admins!: UserInListDto[];
}
