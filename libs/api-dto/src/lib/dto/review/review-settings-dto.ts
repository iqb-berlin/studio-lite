import { ApiProperty } from '@nestjs/swagger';
import { BookletConfigDto } from './booklet-config-dto';
import { ReviewConfigDto } from './review-config-dto';

export class ReviewSettingsDto {
  @ApiProperty()
    bookletConfig?: BookletConfigDto;

  @ApiProperty()
    reviewConfig?: ReviewConfigDto;
}
