import { ApiProperty } from '@nestjs/swagger';

/** What an administrator may change of an installed package: the package name it stands in for (#1358). */
export class UpdateResourcePackageDto {
  @ApiProperty({ example: 'GeoGebra' })
  packageName!: string;
}
