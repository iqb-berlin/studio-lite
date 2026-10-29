import {
  BadRequestException, Body, Controller, Delete, Get, Param, ParseArrayPipe, ParseIntPipe, Patch, Post, Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import {
  CreateUserDto, IdArrayDto,
  UserFullDto, WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';
import { UserId } from '../decorators/user-id.decorator';

/**
 * `admin/users` -- the accounts themselves: creating, changing and deleting them, saying who
 * administers which workspace group, and clearing sessions that are stuck.
 *
 * Assigning users to single workspaces is one level down, in
 * {@link GroupAdminWorkspaceController} and {@link GroupAdminUserController}.
 */
@Controller('admin/users')
export class AdminUserController {
  constructor(
    private usersService: UsersService,
    private workspaceGroupService: WorkspaceGroupService,
    private authService: AuthService
  ) {}

  @Get(':id/workspace-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace groups retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
  @ApiTags('admin user')
  async findOnesWorkspaceGroups(@Param('id') id: number): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll(id);
  }

  @Patch(':id/workspace-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin user')
  @ApiOkResponse({ description: 'Workspace group updated successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  async patchOnesWorkspaceGroups(@Param('id') id: number,
    @Body() body: IdArrayDto): Promise<void> {
    return this.workspaceGroupService.setWorkspaceGroupAdminsByUser(id, body.ids);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin user')
  @ApiOkResponse({ description: 'Users deleted successfully.' })
  @ApiBadRequestResponse({ description: 'The ids include the own account, or no administrator would remain.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
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
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
  @ApiTags('admin user')
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
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
  @ApiNotFoundResponse({ description: 'User_id not found.' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBearerAuth()
  @ApiTags('admin user')
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
  @ApiTags('admin user')
  @ApiOkResponse({ description: 'Session deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
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
  @ApiTags('admin user')
  @ApiOkResponse({ description: 'Orphaned sessions deleted successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace group.' })
  @ApiParam({ name: 'id', type: Number })
  async removeOrphanedSessions(@Param('id') id: number): Promise<number> {
    return this.authService.deleteOrphanedSessions(id);
  }
}
