import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import {
  CreateWorkspaceGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { WorkspaceGroupService } from '../../database/services/workspace-group.service';
import { IsAdminGuard } from '../is-admin.guard';

@Controller('admin/workspace-groups')
export class WorkspaceGroupsController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace-groups retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace-group retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace-group not found.' })
  @ApiTags('admin workspaces')
  async findOne(@Param('id') id: number): Promise<WorkspaceGroupFullDto> {
    return this.workspaceGroupService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace-group deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace group not found.' }) // TODO: not implemented
  @ApiTags('admin workspaces')
  async remove(@Param('id') id: number): Promise<void> {
    return this.workspaceGroupService.remove(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patch(@Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    return this.workspaceGroupService.patch(workspaceGroupFullDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace group in database',
    type: Number
  })
  @ApiTags('admin workspaces')
  async create(@Body() createWorkspaceGroupDto: CreateWorkspaceGroupDto) {
    return this.workspaceGroupService.create(createWorkspaceGroupDto);
  }
}
