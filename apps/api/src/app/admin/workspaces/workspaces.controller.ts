import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags
} from '@nestjs/swagger';
import {
  WorkspaceGroupDto, CreateWorkspaceDto, UserInListDto, WorkspaceFullDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { WorkspaceService } from '../../database/services/workspace.service';
import { UsersService } from '../../database/services/users.service';
import { IsAdminGuard } from '../is-admin.guard';

@Controller('admin/workspaces')
export class WorkspacesController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspaces retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAll();
  }

  // TODO: sollte vermutlich besser über einen Query Parameter gelöst werden (evtl. auch gar keine Aufgabe des BE)?
  @Get('groupwise')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Groupwise ordered workspaces retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAllGroupwise(): Promise<WorkspaceGroupDto[]> {
    return this.workspaceService.findAllGroupwise();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Workspace not found.' })
  @ApiTags('admin workspaces')
  async findOne(@Param('id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  // TODO: Sollen hier mehrere Workspaces gelöscht werden? Sollte über Query gelöst werden.
  @Delete(':ids')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Workspace not found.' }) // TODO: not implemented in workspaceService.remove
  @ApiTags('admin workspaces')
  async remove(@Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.workspaceService.remove(idsAsNumberArray);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace in database',
    type: Number
  })
  @ApiTags('admin workspaces')
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace updated successfully.' })
  @ApiNotFoundResponse({ description: 'Workspace not found.' })
  @ApiTags('admin workspaces')
  async patch(@Body() workspaceFullDto: WorkspaceFullDto) {
    return this.workspaceService.patch(workspaceFullDto);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Workspace users retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Workspace not found.' }) // TODO: not implemented in userService.findAll
  @ApiTags('admin workspaces')
  async findOnesUsers(@Param('id') id: number): Promise<UserInListDto[]> {
    return this.userService.findAll(id);
  }

  // TODO: Werden hier neue User angelegt? Sind es dann nicht eher multiple Posts?
  @Patch(':id/users')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patchOnesUsers(@Param('id') id: number,
    @Body() users: number[]) {
    return this.userService.setUsersByWorkspace(id, users);
  }
}
