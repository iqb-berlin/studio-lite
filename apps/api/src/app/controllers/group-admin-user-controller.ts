import {
  Body, Controller, Get, Param, Patch, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse,
  ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  UserFullDto, UsersWorkspaceInListDto,
  UserWorkspaceAccessForGroupDto,
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
  @ApiQuery({
    name: 'full',
    type: Boolean,
    required: false
  })
  async findAll(@Query('full') full: boolean): Promise<WorkspaceUserInListDto[] | UserFullDto[]> {
    if (full) {
      return this.usersService.findAllFull();
    }
    return this.usersService.findAllUsers();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces updated successfully.' })
  @ApiNotFoundResponse({ description: 'Group admin user not found.' }) // TODO: Exception implementieren?
  @ApiTags('group-admin users')
  async patchOnesWorkspaces(@Param('id') id: number,
    @WorkspaceGroupId() workspaceGroupId: number,
    @Body() body: UserWorkspaceAccessForGroupDto) {
    return this.workspaceService.setWorkspacesByUser(id, body.groupId, body.workspaces);
  }

  @Get(':id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'User not found.' }) // TODO: Exception implementieren?
  @ApiTags('group-admin users')
  async findOnesWorkspaces(@Param('id') id: number): Promise<UsersWorkspaceInListDto[]> {
    return this.workspaceService.findAll(id);
  }
}
