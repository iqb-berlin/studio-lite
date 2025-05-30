import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Patch,
  Post, Query, Res, StreamableFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  CreateWorkspaceGroupDto, UnitByDefinitionIdDto, UserInListDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceService } from '../services/workspace.service';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UsersService } from '../services/users.service';
import { UnitService } from '../services/unit.service';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';

@Controller('admin/workspace-groups')
export class AdminWorkspaceGroupController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private workspaceService: WorkspaceService,
    private unitService: UnitService,
    private userService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-groups retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiQuery({
    name: 'download',
    type: Boolean,
    required: false
  })
  @ApiTags('admin workspace-group')
  async findAll(
    @Query('download') download: boolean,
      @Res({ passthrough: true }) res: Response
  ): Promise<WorkspaceGroupInListDto[] | StreamableFile> {
    if (download) {
      const file = await DownloadWorkspacesClass.getWorkspaceReport(
        this.workspaceService, this.unitService, 0
      );
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="iqb-studio-workspace-report.xlsx"'
      });
      return new StreamableFile(file as Buffer);
    }
    return this.workspaceGroupService.findAll();
  }

  @Get('units')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Units retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin workspace-group')
  async findAllUnits(): Promise<UnitByDefinitionIdDto[]> {
    return this.unitService.findAll();
  }

  @Get(':workspace_group_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-group retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiNotFoundResponse({ description: 'Admin workspace-group not found.' })
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('admin workspace-group')
  async findOne(@WorkspaceGroupId() id: number): Promise<WorkspaceGroupFullDto> {
    return this.workspaceGroupService.findOne(id);
  }

  @Get(':workspace_group_id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'Workspaces of workspace-group retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin workspace-group')
  async findOnesWorkspaces(@WorkspaceGroupId() id: number): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAllByGroup(id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-group deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  // @ApiNotFoundResponse({ description: 'Admin workspace group not found.' }) // TODO: not implemented
  @ApiTags('admin workspace-group')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]): Promise<void> {
    return this.workspaceGroupService.remove(ids);
  }

  @Patch(':workspace_group_id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'Workspace-group updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('admin workspace-group')
  async patch(@WorkspaceGroupId() id: number, @Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    return this.workspaceGroupService.patch(id, workspaceGroupFullDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace group in database',
    type: Number
  })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin workspace-group')
  async create(@Body() createWorkspaceGroupDto: CreateWorkspaceGroupDto) {
    return this.workspaceGroupService.create(createWorkspaceGroupDto);
  }

  @Get(':workspace_group_id/admins')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of admins for workspace-group retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiTags('admin workspace-group')
  async findOnesAdmins(@WorkspaceGroupId() id: number): Promise<UserInListDto[]> {
    return this.userService.findAllWorkspaceGroupAdmins(id);
  }

  @Patch(':workspace_group_id/admins')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of admins for workspace-group updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No admin privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('admin workspace-group')
  async patchOnesAdmins(@WorkspaceGroupId() id: number,
    @Body() users: number[]) {
    return this.userService.setWorkspaceGroupAdmins(id, users);
  }
}
