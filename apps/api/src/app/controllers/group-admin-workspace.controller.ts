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
import UserEntity from '../entities/user.entity';

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

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiNotFoundResponse({ description: 'Admin Workspace not found.' })
  @ApiTags('group-admin workspace')
  async findOne(@Param('id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('group-admin workspace')
  async findOnesUsers(@Param('id') id: number): Promise<WorkspaceUserInListDto[]> {
    return this.userService.findAllUsers(id);
  }

  @Patch(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace users updated successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin workspace')
  async patchOnesUsers(@Param('id') id: number,
    @Body() users: UserWorkspaceAccessDto[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspaces deleted successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiTags('group-admin workspace')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(@Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]): Promise<void> {
    return this.workspaceService.remove(ids);
  }

  /**
   * Moves workspaces into another group. The user is passed on because the service checks the
   * group they are moved OUT of as well -- the guard only established the one they are moved into.
   */
  @Patch('group-id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace moved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiForbiddenResponse({ description: 'Forbidden. No privileges in origin group' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin workspace')
  async patchGroups(@User() user: UserEntity, @Body() body: MoveToDto): Promise<void> {
    return this.workspaceService.patchWorkspaceGroups(body.ids, body.targetId, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new Workspace in database',
    type: Number
  })
  @ApiUnprocessableEntityResponse({ description: 'Creating of workspace in group is forbidden' })
  @ApiUnauthorizedResponse({ description: 'No privileges in group-admin.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('group-admin workspace')
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }
}
