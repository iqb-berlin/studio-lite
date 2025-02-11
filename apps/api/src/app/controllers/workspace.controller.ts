import {
  Body,
  Controller,
  Get, Header,
  Param, ParseArrayPipe, ParseBoolPipe,
  Patch,
  Post,
  Query, Res,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  WorkspaceFullDto,
  RequestReportDto,
  WorkspaceSettingsDto,
  UsersInWorkspaceDto, UserWorkspaceFullDto, GroupNameDto, RenameGroupNameDto, NameDto, CodeBookContentSetting
} from '@studio-lite-lib/api-dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { WorkspaceService } from '../services/workspace.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { WorkspaceId } from '../decorators/workspace.decorator';
import { UnitDownloadClass } from '../classes/unit-download.class';
import { UnitService } from '../services/unit.service';
import { VeronaModulesService } from '../services/verona-modules.service';
import { SettingService } from '../services/setting.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { UsersService } from '../services/users.service';
import { ManageAccessGuard } from '../guards/manage-access.guard';
import UserEntity from '../entities/user.entity';
import { User } from '../decorators/user.decorator';
import { UnitCommentService } from '../services/unit-comment.service';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';

@Controller('workspaces/:workspace_id')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService,
    private unitCommentService: UnitCommentService,
    private veronaModuleService: VeronaModulesService,
    private settingService: SettingService,
    private usersService: UsersService,
    private settingsService: SettingService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceFullDto
  })
  @ApiQuery({
    name: 'download',
    type: Boolean,
    required: false
  })
  @ApiQuery({
    name: 'settings',
    type: String,
    required: false
  })
  @ApiTags('workspace')
  async find(
    @WorkspaceId() workspaceId: number,
      @Query('download') download: boolean,
      @Query('settings') settings: string,
      @Res({ passthrough: true }) res: Response
  ): Promise<WorkspaceFullDto | StreamableFile> {
    if (download) {
      const unitDownloadSettings = JSON.parse(settings);
      const file = await UnitDownloadClass.get(
        workspaceId,
        this.unitService,
        this.unitCommentService,
        this.veronaModuleService,
        this.settingService,
        unitDownloadSettings
      );
      res.set({
        'Content-Type': 'text/html',
        'Content-Disposition': 'attachment; filename="studio-export-units.zip"'
      });
      return new StreamableFile(file);
    }
    return this.workspaceService.findOne(workspaceId);
  }

  @Get('coding-book')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-coding-book.docx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  @ApiTags('workspace')
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async downloadCodingBook(
  @WorkspaceId() workspaceId: number,
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[],
    @Query('format')exportFormat: 'json' | 'docx',
    @Query('missingsProfile')missingsProfile: string,
    @Query('onlyManual', new ParseBoolPipe()) hasOnlyManualCoding: boolean,
    @Query('hasOnlyVarsWithCodes', new ParseBoolPipe()) hasOnlyVarsWithCodes: boolean,
    @Query('generalInstructions', new ParseBoolPipe()) hasGeneralInstructions: boolean,
    @Query('derived', new ParseBoolPipe()) hasDerivedVars: boolean,
    @Query('closed', new ParseBoolPipe()) hasClosedVars: boolean,
    @Query('showScore', new ParseBoolPipe()) showScore: boolean,
    @Query('hideItemVarRelation', new ParseBoolPipe()) hideItemVarRelation: boolean,
    @Query('codeLabelToUpper', new ParseBoolPipe()) codeLabelToUpper: boolean) {
    const options:CodeBookContentSetting = {
      exportFormat,
      missingsProfile: missingsProfile,
      hasOnlyManualCoding: hasOnlyManualCoding,
      hasGeneralInstructions: hasGeneralInstructions,
      hasDerivedVars: hasDerivedVars,
      hasClosedVars: hasClosedVars,
      showScore: showScore,
      codeLabelToUpper: codeLabelToUpper,
      hasOnlyVarsWithCodes: hasOnlyVarsWithCodes,
      hideItemVarRelation: hideItemVarRelation
    };

    const file = await DownloadWorkspacesClass
      .getWorkspaceCodingBook(
        workspaceId,
        this.unitService,
        this.settingsService,
        options,
        ids);
    return new StreamableFile(file as Buffer);
  }

  @Get('users/:user_id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'user_id', type: Number })
  @ApiCreatedResponse({
    type: UserWorkspaceFullDto
  })
  @ApiTags('workspace')
  async findByUser(@WorkspaceId() workspaceId: number,
    @Param('user_id') userId: number
  ): Promise<UserWorkspaceFullDto> {
    return this.workspaceService.findOneByUser(workspaceId, userId);
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

  @Patch('group-name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ManageAccessGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Group name changed' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  async deleteUnitGroup(
  @WorkspaceId() workspaceId: number,
    @Body() body: GroupNameDto | RenameGroupNameDto
  ) {
    return this.workspaceService.patchGroupName(workspaceId, body);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ManageAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @UseInterceptors(FilesInterceptor('files'))
  @ApiTags('workspace')
  @ApiCreatedResponse({
    type: RequestReportDto
  })
  async addUnitFiles(@WorkspaceId() workspaceId: number,
    @User() user: UserEntity,
    @UploadedFiles() files): Promise<RequestReportDto> {
    return this.workspaceService.uploadFiles(workspaceId, files, user);
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

  @Patch('name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  async patchName(@WorkspaceId() workspaceId: number, @Body() body: NameDto) {
    return this.workspaceService.patchName(workspaceId, body.name);
  }

  @Patch('drop-box')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  async patchDropBox(@WorkspaceId() workspaceId: number, @Body('dropBoxId') dropBoxId: number) {
    return this.workspaceService.patchDropBoxId(workspaceId, dropBoxId);
  }
}
