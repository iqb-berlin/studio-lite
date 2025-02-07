import {
  Body, Controller, Get, Param, Patch, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse,
  ApiParam, ApiTags
} from '@nestjs/swagger';
import {
  UserFullDto,
  UserWorkspaceAccessDto,
  WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';

@Controller('group-admin/users')
export class GroupAdminUserController {
  constructor(
    private usersService: UsersService,
    private workspaceService: WorkspaceService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin users retrieved successfully.' })
  @ApiTags('group-admin users')
  async findAll(): Promise<WorkspaceUserInListDto[]> {
    return this.usersService.findAllUsers();
  }

  @Get('full')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin users retrieved successfully.' })
  @ApiTags('group-admin users')
  async findAllFull(): Promise<UserFullDto[]> {
    return this.usersService.findAllFull();
  }

  @Patch(':id/workspaces/:workspace_group_id')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces updated successfully.' })
  @ApiNotFoundResponse({ description: 'Group admin user not found.' }) // TODO: Exception implementieren?
  @ApiTags('admin users')
  async patchOnesWorkspaces(@Param('id') id: number,
    @WorkspaceGroupId() workspaceGroupId: number,
    @Body() workspaces: UserWorkspaceAccessDto[]) {
    return this.workspaceService.setWorkspacesByUser(id, workspaceGroupId, workspaces);
  }
}
