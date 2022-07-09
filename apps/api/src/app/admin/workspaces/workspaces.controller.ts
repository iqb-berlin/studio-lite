import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
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

@Controller('admin/workspaces')
export class WorkspacesController {
  constructor(
    private workspaceService: WorkspaceService,
    private userService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceInListDto]
  })
  @ApiTags('admin workspaces')
  async findAll(): Promise<WorkspaceInListDto[]> {
    return this.workspaceService.findAll();
  }

  @Get('groupwise')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceGroupDto]
  })
  @ApiTags('admin workspaces')
  async findAllGroupwise(): Promise<WorkspaceGroupDto[]> {
    return this.workspaceService.findAllGroupwise();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [WorkspaceFullDto]
  })
  @ApiTags('admin workspaces')
  async findOne(@Param('id') id: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(id);
  }

  @Delete(':ids/:workspace_group_id')
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
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

  @Post(':workspace_group_id')
  @ApiImplicitParam({ name: 'workspace_group_id', type: Number })
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new workspace in database',
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
  @ApiTags('admin workspaces')
  async patch(@Body() workspaceFullDto: WorkspaceFullDto) {
    return this.workspaceService.patch(workspaceFullDto);
  }

  @Get(':id/users')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: [UserInListDto]
  })
  @ApiTags('admin workspaces')
  async findOnesUsers(@Param('id') id: number): Promise<UserInListDto[]> {
    return this.userService.findAll(id);
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
