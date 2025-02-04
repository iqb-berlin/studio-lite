import {
  Body, Controller, Delete, Get, Param, Patch, Post, Req, Request, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import {
  WorkspaceGroupDto,
  CreateWorkspaceDto,
  WorkspaceFullDto,
  WorkspaceUserInListDto,
  UserWorkspaceAccessDto, MoveToDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { UsersService } from '../services/users.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';

@Controller('admin/workspaces')
@UseFilters(HttpExceptionFilter)
export class AdminWorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Get('groupwise')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Groupwise ordered admin workspaces retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAllGroupwise(): Promise<WorkspaceGroupDto[]> {
    return this.workspaceService.findAllGroupwise();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin Workspace not found.' })
  @ApiTags('admin workspaces')
  async findOne(@Param('id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('admin workspaces')
  async findOnesUsers(@Param('id') id: number): Promise<WorkspaceUserInListDto[]> {
    return this.userService.findAllUsers(id);
  }

  @Patch(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patchOnesUsers(@Param('id') id: number,
    @Body() users: UserWorkspaceAccessDto[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }

  @Delete(':ids/:workspace_group_id')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' })
  // TODO: not implemented in workspaceService.remove
  @ApiTags('admin workspaces')
  async remove(@WorkspaceGroupId() workspaceGroupId: number, @Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    const validWorkspaces = await this.workspaceService.findAllByGroup(workspaceGroupId);
    const validWorkspaceIds = validWorkspaces.map(ws => ws.id);
    ids.split(';').forEach(s => {
      const idAsNumber = parseInt(s, 10);
      if (validWorkspaceIds.indexOf(idAsNumber) >= 0) idsAsNumberArray.push(idAsNumber);
    });
    return this.workspaceService.remove(idsAsNumberArray);
  }

  @Patch('move')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace moved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' })
  @ApiTags('admin workspaces')
  async patchGroups(
    @Req() req: Request,
      @Body() body: MoveToDto): Promise<void> {
    return this.workspaceService.patchWorkspaceGroups(body.ids, body.targetId, req['user']);
  }

  @Post(':workspace_group_id')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new admin workspace in database',
    type: Number
  })
  @ApiTags('admin workspaces')
  async create(@WorkspaceGroupId() id: number, @Body() createWorkspaceDto: CreateWorkspaceDto) {
    createWorkspaceDto.groupId = id;
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace updated successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' })
  @ApiTags('admin workspaces')
  async patch(@Body() workspaceFullDto: WorkspaceFullDto) {
    return this.workspaceService.patch(workspaceFullDto);
  }
}
