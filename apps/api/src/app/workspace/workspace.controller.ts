import {
  Body, Controller, Delete, Get, Header, Param, Patch, Post, StreamableFile, UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiParam, ApiTags
} from '@nestjs/swagger';
import {
  WorkspaceFullDto, RequestReportDto, WorkspaceSettingsDto, UsersInWorkspaceDto
} from '@studio-lite-lib/api-dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WorkspaceService } from '../database/services/workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';
import { UnitDownloadClass } from './unit-download.class';
import { UnitService } from '../database/services/unit.service';
import { VeronaModulesService } from '../database/services/verona-modules.service';
import { SettingService } from '../database/services/setting.service';
import { IsWorkspaceGroupAdminGuard } from '../admin/is-workspace-group-admin.guard';
import { UsersService } from '../database/services/users.service';

@Controller('workspace/:workspace_id')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService,
    private veronaModuleService: VeronaModulesService,
    private settingService: SettingService,
    private usersService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceFullDto
  })
  @ApiTags('workspace')
  async find(@WorkspaceId() workspaceId: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(workspaceId);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceFullDto
  })
  @ApiTags('workspace')
  async findUsers(@WorkspaceId() workspaceId: number): Promise<UsersInWorkspaceDto> {
    return this.usersService.findAllWorkspaceUsers(workspaceId);
  }

  @Get('groups')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [String]
  })
  @ApiTags('workspace')
  async findGroups(@WorkspaceId() workspaceId: number): Promise<string[]> {
    return this.workspaceService.findAllWorkspaceGroups(workspaceId);
  }

  @Post('group')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  // todo: declare body parameter {body: 'xxx'} or parse body as string
  async addUnitGroup(@WorkspaceId() workspaceId: number,
    @Body() newGroup) {
    return this.workspaceService.createGroup(workspaceId, newGroup.body);
  }

  @Patch('group/:name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({
    name: 'name',
    type: 'String',
    description: 'hexadecimal representation of the group name'
  })
  @ApiTags('workspace')
  // todo: declare body parameter {body: 'xxx'} or parse body as string
  async renameUnitGroup(@WorkspaceId() workspaceId: number,
    @Param('name') oldGroupName: string,
    @Body() newGroupName) {
    return this.workspaceService
      .patchGroupName(workspaceId, Buffer.from(oldGroupName, 'hex').toString(), newGroupName.body);
  }

  @Patch('group/:name/units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({
    name: 'name',
    type: 'String',
    description: 'hexadecimal representation of the group name'
  })
  @ApiTags('workspace')
  async patchUnitsGroup(@WorkspaceId() workspaceId: number,
    @Param('name') groupName: string,
    @Body() body
  ) {
    return this.workspaceService
      .patchUnitsGroup(workspaceId, Buffer.from(groupName, 'hex').toString(), body.units);
  }

  @Delete('group/:name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({
    name: 'name',
    type: 'String',
    description: 'hexadecimal representation of the group name'
  })
  @ApiTags('workspace')
  async deleteUnitGroup(@WorkspaceId() workspaceId: number, @Param('name') groupName: string) {
    return this.workspaceService.removeGroup(workspaceId, Buffer.from(groupName, 'hex').toString());
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiTags('workspace')
  @ApiCreatedResponse({
    type: RequestReportDto
  })
  async addUnitFiles(@WorkspaceId() workspaceId: number, @UploadedFiles() files): Promise<RequestReportDto> {
    return this.workspaceService.uploadUnits(workspaceId, files);
  }

  @Get('download/:settings')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="studio-export-units.zip"')
  @Header('Cache-Control', 'none')
  @Header('Content-Type', 'application/zip')
  @ApiTags('workspace')
  async downloadUnitsZip(@WorkspaceId() workspaceId: number,
    @Param('settings') unitDownloadSettingsString: string): Promise<StreamableFile> {
    const unitDownloadSettings = JSON.parse(unitDownloadSettingsString);
    const file = await UnitDownloadClass.get(
      workspaceId,
      this.unitService,
      this.veronaModuleService,
      this.settingService,
      unitDownloadSettings
    );
    return new StreamableFile(file);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  async patchSettings(@WorkspaceId() workspaceId: number,
    @Body() workspaceSetting: WorkspaceSettingsDto) {
    return this.workspaceService.patchSettings(workspaceId, workspaceSetting);
  }

  @Patch('rename/:name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  async patchName(@WorkspaceId() workspaceId: number, @Param('name') newName: string) {
    return this.workspaceService.patchName(workspaceId, newName);
  }
}
