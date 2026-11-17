import {
  BadRequestException, Body, Controller, Delete, Get, Param, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Patch,
  Post, Query, UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags
} from '@nestjs/swagger';
import {
  CreateUserDto, IdArrayDto, UserFullDto, WorkspaceGroupInListDto, WorkspaceUserInListDto
} from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { BackgroundRequest } from '../decorators/background-request.decorator';
import { AnyWorkspaceGroupAdmin } from '../decorators/any-workspace-group-admin.decorator';
import { UserId } from '../decorators/user-id.decorator';

/**
 * `users` -- the accounts of the installation. Administrators create, change and delete them, say
 * which groups each administers and clear sessions that are stuck.
 *
 * The list is the one route for group admins as well, and it is served whole, not narrowed to a
 * group: a group admin has to be able to pick anyone to add. So no group stands in its path, and
 * it says with {@link AnyWorkspaceGroupAdmin} that administering any group is enough. Which
 * workspaces of a group a user may work in is {@link WorkspaceGroupUserController} and
 * {@link WorkspaceAccessController}.
 */
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private workspaceGroupService: WorkspaceGroupService,
    private authService: AuthService
  ) {}

  // Polled every 15 s by the admin user list; an open list must not keep its own
  // session alive. The same route serves the user-triggered refresh, which declares
  // intent per request -- a route marking alone cannot tell the two apart.
  @BackgroundRequest('unless-user-intent')
  @Get()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @AnyWorkspaceGroupAdmin()
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Users retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No group-admin privileges.' })
  @ApiTags('users')
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

  /** The groups the user administers -- the other side of `workspace-groups/:id/admins`. */
  @Get(':id/administered-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'The workspace groups the user administers.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('users')
  async findAdministeredGroups(@Param('id') id: number): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll(id);
  }

  @Patch(':id/administered-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('users')
  @ApiOkResponse({ description: 'Workspace group updated successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  async patchAdministeredGroups(@Param('id') id: number,
    @Body() body: IdArrayDto): Promise<void> {
    return this.workspaceGroupService.setWorkspaceGroupAdminsByUser(id, body.ids);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('users')
  @ApiOkResponse({ description: 'Users deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The ids include the own account, or no administrator would remain.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(
    @UserId() ownId: number,
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]
  ): Promise<void> {
    return this.usersService.remove(ids, ownId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number
  })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiTags('users')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * A password set here ends every session of the account, as a change by the user does (#1901).
   * The other fields leave the sessions alone.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiOkResponse({ description: 'User updated successfully. A new password ends every session of the user.' })
  @ApiBadRequestResponse({
    description: 'The administrator right would be taken from the own account, or from the last administrator.'
  })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiNotFoundResponse({ description: 'User_id not found.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBearerAuth()
  @ApiTags('users')
  async patch(
    @UserId() ownId: number,
    @Param('id', ParseIntPipe) userId: number,
    @Body() userFullDto: UserFullDto
  ): Promise<void> {
    await this.usersService.patch(userId, userFullDto, ownId);
    if (userFullDto.password) await this.authService.logout(userId);
  }

  /**
   * Deletes one session -- but only an orphaned one, and answers 400 otherwise. An administrator is
   * not meant to throw a colleague out of a session they are working in; what this clears is a row
   * no one can return to (see `findOrphanedSessionIds`).
   */
  @Delete(':userId/sessions/:sessionId')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('users')
  @ApiOkResponse({ description: 'Session deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiParam({ name: 'sessionId', type: String })
  async removeSession(@Param('userId') userId: number, @Param('sessionId') sessionId: string): Promise<void> {
    const deleted = await this.authService.logoutOrphanedSession(userId, sessionId);
    if (!deleted) {
      throw new BadRequestException('Only orphaned sessions can be deleted.');
    }
  }

  /** Clears every orphaned session of one user at once and answers how many rows went. */
  @Delete(':id/orphaned-sessions')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('users')
  @ApiOkResponse({ description: 'Orphaned sessions deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No admin privileges.' })
  @ApiParam({ name: 'id', type: Number })
  async removeOrphanedSessions(@Param('id') id: number): Promise<number> {
    return this.authService.deleteOrphanedSessions(id);
  }
}
