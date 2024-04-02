import {
  Controller, Get, Header, Param, Query, StreamableFile, UseFilters, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { WorkspaceService } from '../database/services/workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGroupId } from '../admin/workspace-group.decorator';
import { DownloadWorkspacesClass } from './download-workspaces.class';
import { UnitService } from '../database/services/unit.service';
import { IsWorkspaceGroupAdminGuard } from '../admin/is-workspace-group-admin.guard';
import { IsAdminGuard } from '../admin/is-admin.guard';
import { WorkspaceGuard } from '../workspace/workspace.guard';

@Controller('download')
@UseFilters(HttpExceptionFilter)
export class DownloadController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {
  }

  @Get('docx/workspaces/:workspace_group_id/coding-book/:unitList')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-coding-book.docx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  @ApiTags('download')

  async downloadCodingBook(
  @WorkspaceGroupId() workspaceGroupId: number,
    @Param('unitList') unitList: string,
    @Query('format')exportFormat: 'json' | 'docx',
    @Query('onlyManual') hasManualCoding: string,
    @Query('closed') hasClosedResponses: string) {
    const file = await DownloadWorkspacesClass
      .getWorkspaceCodingBook(workspaceGroupId,
        this.unitService,
        exportFormat,
        hasManualCoding,
        hasClosedResponses,
        unitList);
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/workspaces/:workspace_group_id')
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

  @Get('xlsx/unit-metadata-items/:workspace_id/:columns')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-unit-metadata-items-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxItemsMetadata(@Param('workspace_id') workspaceId: number, @Param('columns') columns: string) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      'items', this.unitService, workspaceId, columns);
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/unit-metadata/:workspace_id/:columns')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-unit-metadata-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxUnitsMetadata(@Param('workspace_id') workspaceId: number, @Param('columns') columns: string) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      'units', this.unitService, workspaceId, columns);
    return new StreamableFile(file as Buffer);
  }
}
