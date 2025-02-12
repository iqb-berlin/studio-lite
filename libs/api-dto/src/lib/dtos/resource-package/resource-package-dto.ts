import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResourcePackageDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsNotEmpty()
    elements!: string[];

  @ApiProperty()
    createdAt?: Date;
}
