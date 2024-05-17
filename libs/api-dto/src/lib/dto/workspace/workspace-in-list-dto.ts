// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from "@nestjs/swagger";

export class WorkspaceInListDto {
  @ApiProperty()
    id!: number;

  @ApiProperty()
    name!: string;

  @ApiProperty({ example: 463 })
    groupId!: number;

  // @ApiProperty({ example: 463 })
  //   userHasWriteAccess!: boolean;

  @ApiProperty()
    unitsCount!: number;
}


