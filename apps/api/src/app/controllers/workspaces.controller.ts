import {
  Body, Controller, Delete, ParseArrayPipe, Patch, Query, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse, ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import { MoveToDto } from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { UserId } from '../decorators/user-id.decorator';
import { AnyWorkspaceGroupAdmin } from '../decorators/any-workspace-group-admin.decorator';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';

/**
 * `workspaces` -- what is done to several workspaces at once: deleting them, and moving them into
 * another group. The workspaces may lie in different groups, so no group stands in the path for the
 * guard to check; the handlers ask about every group the request touches (#1005, #1984).
 *
 * A single workspace is {@link WorkspaceController}, who may work in it and at which level
 * {@link WorkspaceAccessController}, and creating one belongs to its group
 * ({@link WorkspaceGroupController}).
 */
@Controller('workspaces')
@UseFilters(HttpExceptionFilter)
export class WorkspacesController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Delete()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspaces deleted successfully.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in the group of one of the workspaces' })
  @ApiTags('workspaces')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@UserId() userId: number,
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]): Promise<void> {
    await this.assertAdministersWorkspaces(userId, ids, 'DELETE');
    return this.workspaceService.remove(ids);
  }

  /**
   * Moves workspaces into another group. Both ends are asked about here, before anything is
   * changed -- the guard cannot, they stand in the body: the target group, and every group the
   * workspaces are moved out of. A move resets the state of their units and drops drop boxes
   * across the new group boundary, so a refused request must not get as far as the service (#1984).
   */
  @Patch('group-id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace moved successfully.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in the origin or the target group' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspaces')
  async patchGroups(@UserId() userId: number, @Body() body: MoveToDto): Promise<void> {
    await this.assertAdministersGroup(userId, body.targetId, 'PATCH');
    await this.assertAdministersWorkspaces(userId, body.ids, 'PATCH');
    return this.workspaceService.patchWorkspaceGroups(body.ids, body.targetId);
  }

  /**
   * Refuses unless the user administers this group. The guard cannot ask this for the routes here,
   * which carry their groups in the body or the query -- it reads the path, and there the group is
   * not (#1005). An administrator passes, as everywhere in this area.
   */
  private async assertAdministersGroup(userId: number, groupId: number, method: string): Promise<void> {
    if (await this.userService.getUserIsAdmin(userId)) return;
    await this.assertIsGroupAdmin(userId, groupId, method);
  }

  /**
   * The same question for a list of workspaces: asked once per group the list touches. Ids that
   * belong to no workspace are not among them and are not asked about -- the route answers 200 for
   * those, and reading them one by one would turn a workspace a colleague has just deleted into a
   * 404 for the whole request.
   */
  private async assertAdministersWorkspaces(userId: number, workspaceIds: number[], method: string): Promise<void> {
    if (await this.userService.getUserIsAdmin(userId)) return;
    const groupIds = await this.workspaceService.findGroupIdsOfWorkspaces(workspaceIds);
    await Promise.all(groupIds.map(groupId => this.assertIsGroupAdmin(userId, groupId, method)));
  }

  /**
   * Group admin or nothing; the administrator has been dealt with by the callers. A missing group
   * is refused before the question is asked: `isWorkspaceGroupAdmin` without one answers
   * "administers any group at all", which is the fallback this whole change removes -- and nothing
   * validates the body, so a request can arrive without a group.
   */
  private async assertIsGroupAdmin(userId: number, groupId: number, method: string): Promise<void> {
    if (!groupId) throw new UserWorkspaceGroupNotAdminException(groupId, method);
    if (await this.userService.isWorkspaceGroupAdmin(userId, groupId)) return;
    throw new UserWorkspaceGroupNotAdminException(groupId, method);
  }
}
