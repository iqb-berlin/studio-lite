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
import {
  CreateWorkspaceDto, NameDto, UnitInViewDto, UnitItemInViewDto, UserInListDto, WorkspaceGroupFullDto,
  WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { WorkspaceGroupAccessGuard } from '../guards/workspace-group-access.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { UnitItemService } from '../services/unit-item.service';
import { UsersService } from '../services/users.service';
import { IsAdminGuard } from '../guards/is-admin.guard';

/**
 * `workspace-groups/:workspace_group_id` -- a single group: read by its members, its admin and any
 * administrator, and changed by its admin or an administrator. What is in it -- its workspaces,
 * units and items -- is its admin's as well; who administers it is an administrator's to say.
 * All groups at once are {@link WorkspaceGroupsController}.
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
    private unitService: UnitService,
    private unitItemService: UnitItemService,
    private usersService: UsersService
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

  @Get('workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'Workspaces of workspace-group retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace-group.' })
  @ApiTags('workspace-group')
  async findWorkspaces(@WorkspaceGroupId() id: number): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAllByGroup(id);
  }

  @Get('units')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'Units of workspace-group retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace-group.' })
  @ApiTags('workspace-group')
  async findUnits(@WorkspaceGroupId() id: number): Promise<UnitInViewDto[]> {
    return this.unitService.findAllForGroup(id);
  }

  @Get('unit-items')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'Unit items of workspace-group retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace-group.' })
  @ApiTags('workspace-group')
  async findUnitItems(@WorkspaceGroupId() id: number): Promise<UnitItemInViewDto[]> {
    return this.unitItemService.findAllForGroup(id);
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'List of admins for workspace-group retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('workspace-group')
  async findAdmins(@WorkspaceGroupId() id: number): Promise<UserInListDto[]> {
    return this.usersService.findAllWorkspaceGroupAdmins(id);
  }

  @Patch('admins')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'List of admins for workspace-group updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace-group')
  async patchAdmins(@WorkspaceGroupId() id: number, @Body() users: number[]) {
    return this.usersService.setWorkspaceGroupAdmins(id, users);
  }
}
