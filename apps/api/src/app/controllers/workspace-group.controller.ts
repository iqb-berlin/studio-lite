import {
  Body,
  Controller, Delete, Get, Param, Patch, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import {

  WorkspaceGroupFullDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UnitService } from '../services/unit.service';

@Controller('workspace-groups/:workspace_group_id')
export class WorkspaceGroupController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private unitService:UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace-group retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Workspace-group not found.' })
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('workspace-group')
  async findOne(@WorkspaceGroupId() id: number): Promise<WorkspaceGroupFullDto> {
    return this.workspaceGroupService.findOne(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiTags('workspace-group')
  async patch(@Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    return this.workspaceGroupService.patch(workspaceGroupFullDto);
  }

  @Delete(':state_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'State removed from workspace group successfully.' })
  @ApiNotFoundResponse({ description: 'Workspace group not found.' })
  @ApiTags('workspace-group')
  async removeState(@WorkspaceGroupId() id: number, @Param('state_id') state_id: string): Promise<void> {
    return this.unitService.deleteState(id, state_id);
  }
}
