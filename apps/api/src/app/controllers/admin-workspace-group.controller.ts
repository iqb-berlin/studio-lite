import {
  Body,
  Controller,
  Delete,
  Get, Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import {
  CreateWorkspaceGroupDto, UnitByDefinitionIdDto, UserInListDto,
  WorkspaceGroupFullDto,
  WorkspaceGroupInListDto, WorkspaceInListDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupService } from '../database/services/workspace-group.service';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceService } from '../database/services/workspace.service';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UsersService } from '../database/services/users.service';
import { UnitService } from '../database/services/unit.service';

@Controller('admin/workspace-groups')
export class AdminWorkspaceGroupController {
  constructor(
    private workspaceGroupService: WorkspaceGroupService,
    private workspaceService: WorkspaceService,
    private unitService: UnitService,
    private userService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace-groups retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceGroupInListDto[]> {
    return this.workspaceGroupService.findAll();
  }

  @Get('units')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin Units retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findAllUnits(): Promise<UnitByDefinitionIdDto[]> {
    return this.unitService.findAll();
  }

  @Get(':workspace_group_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace-group retrieved successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace-group not found.' })
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiTags('admin workspaces')
  async findOne(@WorkspaceGroupId() id: number): Promise<WorkspaceGroupFullDto> {
    return this.workspaceGroupService.findOne(id);
  }

  @Get(':workspace_group_id/workspaces')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @ApiOkResponse({ description: 'Admin workspaces by workspace-group retrieved successfully.' })
  @ApiTags('wsg-admin workspaces')
  async findOnesWorkspaces(@WorkspaceGroupId() id: number): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAllByGroup(id);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Admin workspace-group deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Admin workspace group not found.' }) // TODO: not implemented
  @ApiTags('admin workspaces')
  async remove(@Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = ids.split(';').map(idString => parseInt(idString, 10));
    return this.workspaceGroupService.remove(idsAsNumberArray);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patch(@Body() workspaceGroupFullDto: WorkspaceGroupFullDto) {
    return this.workspaceGroupService.patch(workspaceGroupFullDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace group in database',
    type: Number
  })
  @ApiTags('admin workspaces')
  async create(@Body() createWorkspaceGroupDto: CreateWorkspaceGroupDto) {
    return this.workspaceGroupService.create(createWorkspaceGroupDto);
  }

  @Get(':workspace_group_id/admins')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'List of admins for workspace-group retrieved successfully.' })
  @ApiTags('admin workspaces')
  async findOnesAdmins(@WorkspaceGroupId() id: number): Promise<UserInListDto[]> {
    return this.userService.findAllWorkspaceGroupAdmins(id);
  }

  @Patch(':workspace_group_id/admins')
  @ApiParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiTags('admin workspaces')
  async patchOnesAdmins(@WorkspaceGroupId() id: number,
    @Body() users: number[]) {
    return this.userService.setWorkspaceGroupAdmins(id, users);
  }
}
