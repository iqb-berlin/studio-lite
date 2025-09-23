import { ApiProperty } from '@nestjs/swagger';
import { ReviewBaseDto } from './review-base-dto';

export class ReviewDto extends ReviewBaseDto {
  @ApiProperty()
    workspaceId!: number;

  @ApiProperty()
    workspaceName?: string;

  @ApiProperty()
    workspaceGroupId?: number;

  @ApiProperty()
    workspaceGroupName?: string;

  @ApiProperty()
    numberOfUnits?: number;
}
