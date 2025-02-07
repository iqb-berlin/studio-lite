import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiMethodNotAllowedResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  CreateUserDto,
  UserFullDto, UsersWorkspaceInListDto,
  WorkspaceGroupInListDto
} from '@studio-lite-lib/api-dto';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceService } from '../services/workspace.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceGroupService } from '../services/workspace-group.service';

@Controller('admin/users')
export class AdminUserController {
  constructor(
    private usersService: UsersService,
    private workspaceService: WorkspaceService,
    private workspaceGroupService: WorkspaceGroupService
  ) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin user retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' })
  @ApiTags('admin users')
  async findOne(@Param('id') id: number): Promise<UserFullDto> {
    return this.usersService.findOne(id);
  }

  @Get(':id/workspaces')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin user workspaces retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin user not found.' }) // TODO: Exception implementieren?
  @ApiTags('admin users')
  async findOnesWorkspaces(@Param('id') id: number): Promise<UsersWorkspaceInListDto[]> {
    return this.workspaceService.findAll(id);
  }

  @Get(':id/workspace-groups')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupInListDto]
  })
  @ApiTags('admin users')
  async findOnesWorkspaceGroups(@Param('id') id: number): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll(id);
  }

  @Patch(':id/workspace-groups')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async patchOnesWorkspaceGroups(@Param('id') id: number,
    @Body() workspaceGroups: number[]) {
    return this.workspaceGroupService.setWorkspaceGroupAdminsByUser(id, workspaceGroups);
  }

  // TODO: Delete mit id (statt ids) nur für ein Element (für mehrere s.u.)
  @Delete(':ids')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  @ApiOkResponse({ description: 'Admin users deleted successfully.' })
  async remove(@Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.usersService.remove(idsAsNumberArray);
  }

  // TODO: Delete mit QueryParam für mehrere Elemente im Frontend implementieren
  @Delete()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: false
  })
  @ApiOkResponse({ description: 'Admin users deleted successfully.' })
  @ApiMethodNotAllowedResponse({ description: 'Active admin user must not be deleted.' })
  async removeIds(ids: number[]): Promise<void> {
    return this.usersService.removeIds(ids);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new user in database',
    type: Number
  })
  @ApiTags('admin users')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin users')
  async patch(@Body() userFullDto: UserFullDto) {
    return this.usersService.patch(userFullDto);
  }
}
