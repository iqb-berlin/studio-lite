import {
  Body,
  Controller, Get, Patch, Query, Res, StreamableFile, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {

  WorkspaceGroupFullDto
} from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';

@Controller('workspace-groups/:workspace_group_id')
export class WorkspaceGroupController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-group retrieved successfully.' })
  @ApiQuery({
    name: 'download',
    type: Boolean,
    required: false
  })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace-group' })
  @ApiNotFoundResponse({ description: 'Workspace-group not found.' })
  @ApiInternalServerErrorResponse({ description: 'Invalid workspace-group. ' })
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('workspace-group')
  async findOne(
    @WorkspaceGroupId() id: number,
      @Query('download') download: boolean,
      @Res({ passthrough: true }) res: Response
  ): Promise<WorkspaceGroupFullDto | StreamableFile> {
    if (download) {
      const file = await DownloadWorkspacesClass.getWorkspaceReport(
        this.workspaceService, this.unitService, id
      );
      res.set({
        'Content-Type': 'attachment; filename="iqb-studio-workspace-report.xlsx"',
        'Content-Disposition': 'attachment; filename="iqb-studio-workspace-report.xlsx"'
      });
      return new StreamableFile(file as Buffer);
    }
    return this.workspaceGroupService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiOkResponse({ description: 'Workspace-group updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace-group' })
  @ApiInternalServerErrorResponse({ description: 'Invalid workspace-group. ' })
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('workspace-group')
  async patch(@WorkspaceGroupId() id: number, @Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    return this.workspaceGroupService.patch(id, workspaceGroupFullDto);
  }
}
