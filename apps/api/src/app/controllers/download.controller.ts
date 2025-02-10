import {
  Controller, Get, Header, Param, StreamableFile, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiParam, ApiTags
} from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { WorkspaceService } from '../services/workspace.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { UnitService } from '../services/unit.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';

@Controller('download')
@UseFilters(HttpExceptionFilter)
export class DownloadController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {
  }

  @Get('xlsx/workspace-groups/:workspace_group_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-workspace-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxWorkspacesByGroup(@WorkspaceGroupId() workspaceGroupId: number) {
    const file = await DownloadWorkspacesClass.getWorkspaceReport(
      this.workspaceService, this.unitService, workspaceGroupId
    );
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/workspaces')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-workspace-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxWorkspaces() {
    const file = await DownloadWorkspacesClass.getWorkspaceReport(
      this.workspaceService, this.unitService, 0
    );
    return new StreamableFile(file as Buffer);
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
