import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateWorkspaceGroupDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { WorkspaceGroupService } from '../../database/services/workspace-group.service';
import { IsAdminGuard } from '../is-admin.guard';
import { WorkspaceService } from '../../database/services/workspace.service';
import { WorkspaceGroupId } from '../workspace-group.decorator';

@Controller('admin/workspace-groups')
export class WorkspaceGroupsController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private workspaceService: WorkspaceService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupInListDto]
  })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll();
  }

  @Get(':workspace_group_id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceGroupFullDto
  })
  @ApiTags('admin workspaces')
  async findOne(@WorkspaceGroupId() id: number): Promise<WorkspaceGroupFullDto> {
    return this.workspaceGroupService.findOne(id);
  }

  @Get(':workspace_group_id/workspaces')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
  @ApiCreatedResponse({
    type: [WorkspaceInListDto]
  })
  @ApiTags('wsg-admin workspaces')
  async findOnesWorkspaces(@WorkspaceGroupId() id: number): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAllByGroup(id);
  }

  @Delete(':workspace_group_id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('admin workspaces')
  async remove(@WorkspaceGroupId() id: number): Promise<void> {
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
