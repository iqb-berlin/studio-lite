import { ApiProperty } from '@nestjs/swagger';
import { ReviewDto } from './review/review-dto';
import { WorkspaceGroupDto } from './workspace-group/workspace-group-dto';

export class AuthDataDto {
  @ApiProperty()
    userId!: number;

  @ApiProperty()
    userName!: string;

  @ApiProperty()
    userLongName!: string;

  @ApiProperty()
    isAdmin!: boolean;

  @ApiProperty()
    workspaces!: WorkspaceGroupDto[];

  @ApiProperty()
    reviews!: ReviewDto[];
}
