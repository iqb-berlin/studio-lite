import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Post, Query, Res, StreamableFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { CreateWorkspaceGroupDto, WorkspaceGroupInListDto } from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';

/**
 * `workspace-groups` -- all groups of the installation, for administrators: the list, the report
 * over every workspace, creating and deleting groups. A single group, what is in it and who
 * administers it is {@link WorkspaceGroupController}.
 */
@Controller('workspace-groups')
export class WorkspaceGroupsController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private workspaceService: WorkspaceService,
    private unitService: UnitService
  ) {}

  /**
   * All groups -- or, with `download`, the xlsx report over every workspace of the installation.
   * The group id 0 handed to the report is what stands for "no group in particular"; the same
   * report narrowed to one group is served by {@link WorkspaceGroupController}.
   */
  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-groups retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiQuery({
    name: 'download',
    type: Boolean,
    required: false
  })
  @ApiTags('workspace-groups')
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
      return new StreamableFile(file as unknown as Uint8Array);
    }
    return this.workspaceGroupService.findAll();
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-group deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  // @ApiNotFoundResponse({ description: 'Admin workspace group not found.' }) // TODO: not implemented
  @ApiTags('workspace-groups')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]): Promise<void> {
    return this.workspaceGroupService.remove(ids);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace group in database',
    type: Number
  })
  @ApiBadRequestResponse({ description: 'The settings are no object, or a field in them has the wrong type.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('workspace-groups')
  async create(@Body() createWorkspaceGroupDto: CreateWorkspaceGroupDto) {
    return this.workspaceGroupService.create(createWorkspaceGroupDto);
  }
}
