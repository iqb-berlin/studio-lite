import {
  Body, Controller, Get, Param, Patch, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiInternalServerErrorResponse, ApiOkResponse,
  ApiQuery, ApiTags, ApiUnauthorizedResponse
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
  @ApiUnauthorizedResponse({ description: 'No group-admin privileges.' })
  @ApiTags('group-admin user')
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

  @Patch(':id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No group-admin privileges.' })
  // @ApiNotFoundResponse({ description: 'Group admin user not found.' }) // TODO: Exception implementieren?
  @ApiInternalServerErrorResponse({ description: 'Internal error. The user_id not found.' })
  @ApiTags('group-admin user')
  async patchOnesWorkspaces(@Param('id') id: number,
    @Body() body: UserWorkspaceAccessForGroupDto) {
    return this.workspaceService.setWorkspacesByUser(id, body.groupId, body.workspaces);
  }

  @Get(':id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No group-admin privileges. ' })
  // @ApiNotFoundResponse({ description: 'User not found.' }) // TODO: Exception implementieren?
  @ApiTags('group-admin user')
  async findOnesWorkspaces(@Param('id') id: number): Promise<UsersWorkspaceInListDto[]> {
    return this.workspaceService.findAll(id);
  }
}
