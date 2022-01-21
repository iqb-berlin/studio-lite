import { ApiProperty } from '@nestjs/swagger';

export class UserInListDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isAdmin!: boolean;

  @ApiProperty()
  description: string | undefined;
}
