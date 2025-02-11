import {
  Controller, Get, Param, Query, Res, StreamableFile, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger';
import type { Response } from 'express';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { UnitService } from '../services/unit.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';

@Controller('download')
@UseFilters(HttpExceptionFilter)
export class DownloadController {
  constructor(
    private unitService: UnitService
  ) {
  }

  @Get('xlsx/unit-metadata/:workspace_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiQuery({
    name: 'column',
    type: String,
    isArray: true,
    required: true
  })
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  @ApiQuery({
    name: 'type',
    type: String
  })
  @ApiTags('download')
  async downloadXlsxUnitsMetadata(
  @Param('workspace_id') workspaceId: number,
    @Query('column') columns: string[],
    @Query('id') units: number[],
    @Query('type') type: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      type, this.unitService, workspaceId, [columns].flat(), [units].flat());
    const filename = type === 'unit' ?
      'iqb-studio-unit-metadata-report.xlsx' : 'iqb-studio-unit-metadata-items-report.xlsx';
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`
    });
    return new StreamableFile(file as Buffer);
  }
}
