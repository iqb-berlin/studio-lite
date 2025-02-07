import {
  Body, Controller, Delete, Get, Param, ParseArrayPipe, Patch, Post, Query, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags
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
  @ApiOkResponse({ description: 'Admin workspace retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin Workspace not found.' })
  @ApiTags('group-admin workspace')
  async findOne(@Param('id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('group-admin workspace')
  async findOnesUsers(@Param('id') id: number): Promise<WorkspaceUserInListDto[]> {
    return this.userService.findAllUsers(id);
  }

  @Patch(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiTags('group-admin workspace')
  async patchOnesUsers(@Param('id') id: number,
    @Body() users: UserWorkspaceAccessDto[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace deleted successfully.' })
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

  @Patch('move')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace moved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' })
  @ApiTags('group-admin workspace')
  async patchGroups(@User() user: UserEntity, @Body() body: MoveToDto): Promise<void> {
    return this.workspaceService.patchWorkspaceGroups(body.ids, body.targetId, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new admin workspace in database',
    type: Number
  })
  @ApiTags('group-admin workspace')
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace updated successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' })
  @ApiTags('group-admin workspace')
  async patch(@Body() workspaceFullDto: WorkspaceFullDto) {
    return this.workspaceService.patch(workspaceFullDto);
  }
}
