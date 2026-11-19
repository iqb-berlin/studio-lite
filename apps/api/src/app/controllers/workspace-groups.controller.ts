import {
  Body,
  Controller,
  Delete,
  Get,
  ParseArrayPipe,
  Post, Query,
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
import { CreateWorkspaceGroupDto, WorkspaceGroupInListDto, WorkspaceReportDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UnitService } from '../services/unit.service';
import { WorkspaceReportClass } from '../classes/workspace-report.class';

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

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-groups retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('workspace-groups')
  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll();
  }

  /**
   * The report over every workspace of the installation, which the interface turns into an Excel
   * file (#2181). The group id 0 stands for "no group in particular"; the same report narrowed to
   * one group is served by {@link WorkspaceGroupController}. This controller is registered before
   * that one, so `report` is not read as a group id.
   */
  @Get('report')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: [WorkspaceReportDto] })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('workspace-groups')
  async findReport(): Promise<WorkspaceReportDto[]> {
    return WorkspaceReportClass.build(this.workspaceService, this.unitService, 0);
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
