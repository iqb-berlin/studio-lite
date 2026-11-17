import {
  Body,
  Controller, Get, Patch, Post, Query, Res, StreamableFile, UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import { CreateWorkspaceDto, NameDto, WorkspaceGroupFullDto } from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { WorkspaceGroupAccessGuard } from '../guards/workspace-group-access.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';

/**
 * `workspace-groups/:workspace_group_id` -- a single group: read by its members, its admin and any
 * administrator, and changed by its admin or an administrator, who also create its workspaces here.
 *
 * The GET has a second shape: with `download` it answers with the xlsx report over all workspaces
 * of the group instead of the group itself. The group passes for its members, the report only for
 * its admin or an administrator -- see {@link WorkspaceGroupAccessGuard}.
 */
@Controller('workspace-groups/:workspace_group_id')
export class WorkspaceGroupController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGroupAccessGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-group retrieved successfully.' })
  @ApiQuery({
    name: 'download',
    type: Boolean,
    required: false
  })
  @ApiUnauthorizedResponse({ description: 'Authentication is required.' })
  @ApiForbiddenResponse({
    description: 'No workspace in the group, or the report without being the group\'s admin.'
  })
  @ApiNotFoundResponse({ description: 'Workspace-group not found.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
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
      return new StreamableFile(file as unknown as Uint8Array);
    }
    return this.workspaceGroupService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiOkResponse({ description: 'Workspace-group updated successfully.' })
  @ApiBadRequestResponse({ description: 'The settings are no object, or a field in them has the wrong type.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace-group' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('workspace-group')
  async patch(@WorkspaceGroupId() id: number, @Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    return this.workspaceGroupService.patch(id, workspaceGroupFullDto);
  }

  /**
   * A new workspace in this group, for its admin. The group is the one in the path, which the guard
   * has checked; of the body only the name is taken (#2029, #1216).
   */
  @Post('workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new Workspace in database',
    type: Number
  })
  @ApiUnprocessableEntityResponse({ description: 'Creating of workspace in group is forbidden' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace-group.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace-group')
  async createWorkspace(@WorkspaceGroupId() id: number, @Body() body: NameDto): Promise<number> {
    return this.workspaceService.create(<CreateWorkspaceDto>{ groupId: id, name: body.name });
  }
}
