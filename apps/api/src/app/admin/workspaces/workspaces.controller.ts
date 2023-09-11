import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseFilters, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import {
  WorkspaceGroupDto, CreateWorkspaceDto, UserInListDto, WorkspaceFullDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { WorkspaceService } from '../../database/services/workspace.service';
import { UsersService } from '../../database/services/users.service';
import { IsAdminGuard } from '../is-admin.guard';
import { IsWorkspaceGroupAdminGuard } from '../is-workspace-group-admin.guard';
import { WorkspaceGroupId } from '../workspace-group.decorator';
import { HttpExceptionFilter } from '../../exceptions/http-exception.filter';

@Controller('admin/workspaces')
@UseFilters(HttpExceptionFilter)
export class WorkspacesController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspaces retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAll();
  }

  // TODO: sollte vermutlich besser über einen Query Parameter gelöst werden (evtl. auch gar keine Aufgabe des BE)?
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

  // TODO: Sollen hier mehrere Workspaces gelöscht werden? Sollte über Query gelöst werden.
  @Delete(':ids/:workspace_group_id')
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
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

  @Patch(':ids/:workspace_group_id')
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' })
  @ApiTags('admin workspaces')
  async patchGroups(@Param('ids') ids: string, @Param('workspace_group_id') workspace_group_id: number): Promise<void> {
    const splittedIds = ids.split(';');
    return this.workspaceService.patchWorkspaceGroups(splittedIds, workspace_group_id);
  }

  @Post(':workspace_group_id')
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
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

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('admin workspaces')
  async findOnesUsers(@Param('id') id: number): Promise<UserInListDto[]> {
    return this.userService.findAllUsers(id);
  }

  @Patch(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patchOnesUsers(@Param('id') id: number,
    @Body() users: number[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }
}
