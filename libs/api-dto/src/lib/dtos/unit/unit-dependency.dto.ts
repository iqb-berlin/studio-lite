import { ApiProperty } from '@nestjs/swagger';
import { UNIT_DEPENDENCY_TYPES, UnitDependency, UnitDependencyType } from '@studio-lite/shared-code';

/**
 * Something a unit needs beside its player or editor, as the editor reports it with the definition
 * (`dependenciesToPlay`, `dependenciesToEdit`): a resource package by its file name
 * (`GeoGebra.itcr.zip`), a widget by its type (`PERIODIC_TABLE`), a service (#1602).
 */
export class UnitDependencyDto implements UnitDependency {
  @ApiProperty({ example: 'GeoGebra.itcr.zip' })
  id!: string;

  @ApiProperty({ enum: UNIT_DEPENDENCY_TYPES, example: 'FILE_TO_UNPACK' })
  type!: UnitDependencyType;
}
