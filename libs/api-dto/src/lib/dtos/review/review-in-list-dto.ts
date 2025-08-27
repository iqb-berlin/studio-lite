import { ApiProperty } from '@nestjs/swagger';
import { ReviewBaseDto } from './review-base-dto';

export class ReviewInListDto extends ReviewBaseDto {
  @ApiProperty()
    link?: string;
}
