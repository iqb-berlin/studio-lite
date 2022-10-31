import {
  Controller, Get, Header, StreamableFile, UseFilters, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { WorkspaceService } from '../database/services/workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGroupId } from '../admin/workspace-group.decorator';
import { XlsxDownloadWorkspacesClass } from './xlsx-download-workspaces.class';
import { UnitService } from '../database/services/unit.service';
import { IsWorkspaceGroupAdminGuard } from '../admin/is-workspace-group-admin.guard';
import { IsAdminGuard } from '../admin/is-admin.guard';

@Controller('download')
@UseFilters(HttpExceptionFilter)
export class DownloadController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {
  }

  @Get('xlsx/workspaces/:workspace_group_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-workspace-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxWorkspacesByGroup(@WorkspaceGroupId() workspaceGroupId: number) {
    const file = await XlsxDownloadWorkspacesClass.getWorkspaceReport(
      this.workspaceService, this.unitService, workspaceGroupId
    );
    return new StreamableFile(file);
  }

  @Get('xlsx/workspaces')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-workspace-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxWorkspaces() {
    const file = await XlsxDownloadWorkspacesClass.getWorkspaceReport(
      this.workspaceService, this.unitService, 0
    );
    return new StreamableFile(file);
  }
}
