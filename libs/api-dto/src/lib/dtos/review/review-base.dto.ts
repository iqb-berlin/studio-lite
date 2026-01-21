import { ApiProperty } from '@nestjs/swagger';

export class ReviewBaseDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name?: string;

  @ApiProperty()
    createdAt?: Date;

  @ApiProperty()
    changedAt?: Date;
}
