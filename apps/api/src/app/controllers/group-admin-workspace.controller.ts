import {
  Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Post, Query, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse, ApiUnprocessableEntityResponse
} from '@nestjs/swagger';
import {
  CreateWorkspaceDto,
  WorkspaceFullDto,
  WorkspaceUserInListDto,
  UserWorkspaceAccessDto, MoveToDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { User } from '../decorators/user.decorator';
import { UserId } from '../decorators/user-id.decorator';
import UserEntity from '../entities/user.entity';
import { AnyWorkspaceGroupAdmin } from '../decorators/any-workspace-group-admin.decorator';
import { UserWorkspaceGroupNotAdminException } from '../exceptions/user-workspace-group-not-admin.exception';

/**
 * `group-admin/workspaces` -- what a group admin does with the workspaces of their group: create
 * and delete them, move one into another group, and decide who works in each and at which access
 * level.
 *
 * Working IN a workspace is {@link WorkspaceController}; this is the level above it, and it is
 * reached without being assigned to any of the workspaces it acts on.
 */
@Controller('group-admin/workspaces')
@UseFilters(HttpExceptionFilter)
export class GroupAdminWorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Get(':workspace_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiNotFoundResponse({ description: 'Admin Workspace not found.' })
  @ApiTags('group-admin workspace')
  async findOne(@Param('workspace_id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  @Get(':workspace_id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('group-admin workspace')
  async findOnesUsers(@Param('workspace_id') id: number): Promise<WorkspaceUserInListDto[]> {
    return this.userService.findAllUsers(id);
  }

  @Patch(':workspace_id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace users updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin workspace')
  async patchOnesUsers(@Param('workspace_id') id: number,
    @Body() users: UserWorkspaceAccessDto[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspaces deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in the group of one of the workspaces' })
  @ApiTags('group-admin workspace')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@UserId() userId: number,
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]): Promise<void> {
    await this.assertAdministersWorkspaces(userId, ids);
    return this.workspaceService.remove(ids);
  }

  /**
   * Moves workspaces into another group. Both ends are asked about, in two places: the target group
   * here -- the guard cannot, it stands in the body -- and the group they are moved OUT of in the
   * service, which is why the user is passed on.
   */
  @Patch('group-id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace moved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in the origin or the target group' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin workspace')
  async patchGroups(@User() user: UserEntity, @Body() body: MoveToDto): Promise<void> {
    await this.assertAdministersGroup(user.id, body.targetId, 'PATCH');
    return this.workspaceService.patchWorkspaceGroups(body.ids, body.targetId, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new Workspace in database',
    type: Number
  })
  @ApiUnprocessableEntityResponse({ description: 'Creating of workspace in group is forbidden' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in the group the workspace goes into' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin workspace')
  async create(@UserId() userId: number, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    await this.assertAdministersGroup(userId, createWorkspaceDto.groupId, 'POST');
    return this.workspaceService.create(createWorkspaceDto);
  }

  /**
   * Refuses unless the user administers this group. The guard cannot ask this for the three routes
   * that carry their group in the body or the query -- it reads the path, and there the group is
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
  private async assertAdministersWorkspaces(userId: number, workspaceIds: number[]): Promise<void> {
    if (await this.userService.getUserIsAdmin(userId)) return;
    const groupIds = await this.workspaceService.findGroupIdsOfWorkspaces(workspaceIds);
    await Promise.all(groupIds.map(groupId => this.assertIsGroupAdmin(userId, groupId, 'DELETE')));
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
