import {
  Controller, Get, Header, Param, StreamableFile, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiParam, ApiTags
} from '@nestjs/swagger';
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

  @Get('xlsx/unit-metadata-items/:workspace_id/:selection')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-unit-metadata-items-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxItemsMetadata(@Param('workspace_id') workspaceId: number, @Param('selection') selection: string) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      'items', this.unitService, workspaceId, selection);
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/unit-metadata/:workspace_id/:selection')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-unit-metadata-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxUnitsMetadata(@Param('workspace_id') workspaceId: number, @Param('selection') selection: string) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      'units', this.unitService, workspaceId, selection);
    return new StreamableFile(file as Buffer);
  }
}
