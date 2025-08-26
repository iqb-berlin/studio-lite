import { ApiProperty } from '@nestjs/swagger';
import { ReviewSettingsDto } from './review-settings-dto';
import { ReviewBaseDto } from './review-base-dto';

export class ReviewFullDto extends ReviewBaseDto {
  @ApiProperty()
    workspaceId?: number;

  @ApiProperty()
    workspaceName?: string;

  @ApiProperty()
    workspaceGroupId?: number;

  @ApiProperty()
    workspaceGroupName?: string;

  @ApiProperty()
    link?: string;

  @ApiProperty()
    password?: string;

  @ApiProperty()
    settings?: ReviewSettingsDto;

  @ApiProperty()
    units?: number[];
}
