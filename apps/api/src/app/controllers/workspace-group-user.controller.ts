import {
  Body, Controller, Get, Param, Patch, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOkResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import { UsersWorkspaceInListDto, UserWorkspaceAccessDto } from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UserId } from '../decorators/user-id.decorator';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';

/**
 * `workspace-groups/:workspace_group_id/users/:user_id/workspaces` -- which workspaces of a group a
 * user may work in, and at which access level, as the admin of the group reads and sets it.
 *
 * The group stands in the path, so the guard asks whether the requester administers it. Until #1216
 * it stood in the body, where the guard does not look, and the handler had to ask (#1005, #1650).
 */
@Controller('workspace-groups/:workspace_group_id/users/:user_id/workspaces')
export class WorkspaceGroupUserController {
  constructor(
    private usersService: UsersService,
    private workspaceService: WorkspaceService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiParam({ name: 'user_id', type: Number })
  @ApiOkResponse({ description: 'The workspaces of the group the user works in, with the access level.' })
  @ApiForbiddenResponse({ description: 'No privileges in the group.' })
  @ApiTags('workspace-group user')
  async findAll(
    @WorkspaceGroupId() workspaceGroupId: number,
    @Param('user_id') userId: number
  ): Promise<UsersWorkspaceInListDto[]> {
    return this.workspaceService.findAllInGroup(userId, workspaceGroupId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiParam({ name: 'user_id', type: Number })
  @ApiOkResponse({ description: 'The workspaces of the user in this group updated successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the group, or a workspace outside it.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace-group user')
  async patch(
    @UserId() requesterId: number,
    @WorkspaceGroupId() workspaceGroupId: number,
    @Param('user_id') userId: number,
    @Body() workspaces: UserWorkspaceAccessDto[]
  ) {
    await this.assertWorkspacesInGroup(requesterId, workspaceGroupId, workspaces);
    return this.workspaceService.setWorkspacesByUser(userId, workspaceGroupId, workspaces);
  }

  /**
   * The workspaces have to be the group's own: their ids arrive in the body and the service writes
   * them without looking, so administering one group would otherwise be the key to every workspace
   * named beside it (#1005). An administrator passes, as everywhere in this area; the route answers
   * a nonsensical group with a 500 for them as it always did.
   */
  private async assertWorkspacesInGroup(
    requesterId: number, workspaceGroupId: number, workspaces: UserWorkspaceAccessDto[]
  ): Promise<void> {
    if (await this.usersService.getUserIsAdmin(requesterId)) return;
    const groupIds = await this.workspaceService
      .findGroupIdsOfWorkspaces(workspaces.map(workspace => workspace.id));
    const foreignGroupId = groupIds.find(candidate => candidate !== workspaceGroupId);
    if (foreignGroupId) throw new UserWorkspaceGroupNotAdminException(foreignGroupId, 'PATCH');
  }
}
