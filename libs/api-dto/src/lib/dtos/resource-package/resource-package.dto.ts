import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResourcePackageDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ description: 'The name it is installed under, without the ending -- also its folder' })
  name!: string;

  @ApiProperty({ description: 'The name units give for the package it stands in for (#1358)', example: 'GeoGebra' })
  packageName!: string;

  @ApiProperty()
  @IsString({ each: true })
  @IsNotEmpty()
  elements!: string[];

  @ApiProperty()
  createdAt?: Date;
}
