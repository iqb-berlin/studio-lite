import { ApiProperty } from '@nestjs/swagger';
import { ReviewSettingsDto } from './review-settings-dto';

export class ReviewFullDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name?: string;

  @ApiProperty()
  workspaceId?: number;

  @ApiProperty()
  link?: string;

  @ApiProperty()
  settings?: ReviewSettingsDto;

  @ApiProperty()
  units?: number[];
}
