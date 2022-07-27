import { ApiProperty } from '@nestjs/swagger';

export class ReviewSettingsDto {
  @ApiProperty()
  pagingMode = '';
}
