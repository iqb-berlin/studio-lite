import { ApiProperty } from '@nestjs/swagger';

export class ReviewConfigDto {
  @ApiProperty()
    canComment? = true;

  @ApiProperty()
    showOthersComments? = false;

  @ApiProperty()
    showCoding? = false;

  @ApiProperty()
    showMetadata? = true;
}
