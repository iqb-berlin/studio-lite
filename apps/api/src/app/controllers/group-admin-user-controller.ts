import {
  Body, Controller, Get, Param, ParseBoolPipe, Patch, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse,
  ApiQuery, ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  UserFullDto, UsersWorkspaceInListDto,
  UserWorkspaceAccessDto,
  UserWorkspaceAccessForGroupDto,
  WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { BackgroundRequest } from '../decorators/background-request.decorator';
import { AnyWorkspaceGroupAdmin } from '../decorators/any-workspace-group-admin.decorator';
import { UserId } from '../decorators/user-id.decorator';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';

/**
 * `group-admin/users` -- what a group admin does with people: see the users and set which
 * workspaces of their group each may work in, and at which access level.
 *
 * The user list is served whole here, not narrowed to the group: a group admin has to be able to
 * pick anyone to add. What is theirs to change is the assignment, and that is written per group.
 */
@Controller('group-admin/users')
export class GroupAdminUserController {
  constructor(
    private usersService: UsersService,
    private workspaceService: WorkspaceService
  ) {}

  // Polled every 15 s by the admin user list; an open list must not keep its own
  // session alive. The same route serves the user-triggered refresh, which declares
  // intent per request -- a route marking alone cannot tell the two apart.
  @BackgroundRequest('unless-user-intent')
  @Get()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin users retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No group-admin privileges.' })
  @ApiTags('group-admin user')
  @ApiQuery({
    name: 'full',
    type: Boolean,
    required: false
  })
  async findAll(@Query('full',
    new ParseBoolPipe({ optional: true })) full?: boolean): Promise<WorkspaceUserInListDto[] | UserFullDto[]> {
    if (full) {
      return this.usersService.findAllFull();
    }
    return this.usersService.findAllUsers();
  }

  @Patch(':id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No group-admin privileges.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in the group, or a workspace outside it' })
  // @ApiNotFoundResponse({ description: 'Group admin user not found.' }) // TODO: Exception implementieren?
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin user')
  async patchOnesWorkspaces(@UserId() userId: number, @Param('id') id: number,
    @Body() body: UserWorkspaceAccessForGroupDto) {
    await this.assertMayWriteAccessRights(userId, body);
    return this.workspaceService.setWorkspacesByUser(id, body.groupId, body.workspaces);
  }

  @Get(':id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group admin user workspaces retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No group-admin privileges. ' })
  // @ApiNotFoundResponse({ description: 'User not found.' }) // TODO: Exception implementieren?
  @ApiTags('group-admin user')
  async findOnesWorkspaces(@Param('id') id: number): Promise<UsersWorkspaceInListDto[]> {
    return this.workspaceService.findAll(id);
  }

  /**
   * The group whose access rights are being written stands in the body, and the path names a user
   * -- so the guard, which reads the path, cannot ask this and lets through whoever administers any
   * group at all (#1005). Whoever writes rights into a group administers that group, and the
   * workspaces have to be that group's own: the ids arrive in the same body and the service writes
   * them without looking, so one group would otherwise be the key to every workspace named beside
   * it. A request without a group is refused rather than asked about, since `isWorkspaceGroupAdmin`
   * reads a missing group as "any group at all".
   *
   * An administrator passes before all of it, as everywhere in this area: none of this is a
   * question about them, and the route answers a nonsensical group with a 500 as it always did.
   */
  private async assertMayWriteAccessRights(userId: number, body: UserWorkspaceAccessForGroupDto): Promise<void> {
    if (await this.usersService.getUserIsAdmin(userId)) return;
    if (!body.groupId) throw new UserWorkspaceGroupNotAdminException(body.groupId, 'PATCH');
    if (!await this.usersService.isWorkspaceGroupAdmin(userId, body.groupId)) {
      throw new UserWorkspaceGroupNotAdminException(body.groupId, 'PATCH');
    }
    await this.assertWorkspacesInGroup(body.groupId, body.workspaces);
  }

  /** The groups the listed workspaces belong to; anything but the one being written is refused. */
  private async assertWorkspacesInGroup(groupId: number, workspaces: UserWorkspaceAccessDto[]): Promise<void> {
    const groupIds = await this.workspaceService
      .findGroupIdsOfWorkspaces(workspaces.map(workspace => workspace.id));
    const foreignGroupId = groupIds.find(candidate => candidate !== Number(groupId));
    if (foreignGroupId) throw new UserWorkspaceGroupNotAdminException(foreignGroupId, 'PATCH');
  }
}
