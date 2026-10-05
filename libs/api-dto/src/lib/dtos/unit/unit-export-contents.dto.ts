import { ApiProperty } from '@nestjs/swagger';

/**
 * Which of the optional export files a unit would fill. The export dialog offers a file only when
 * one of the chosen units has content for it, and the export writes no file without content.
 */
export class UnitExportContentsDto {
  @ApiProperty()
  unitId!: number;

  @ApiProperty()
  metadata!: boolean;

  @ApiProperty()
  items!: boolean;

  @ApiProperty()
  codingScheme!: boolean;

  @ApiProperty()
  comments!: boolean;

  @ApiProperty()
  richNotes!: boolean;
}
