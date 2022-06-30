import {
  Body,
  Controller, Get, Header, Param, Patch, Post, StreamableFile, UploadedFiles, UseGuards, UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { WorkspaceFullDto, RequestReportDto, WorkspaceSettingsDto } from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { WorkspaceService } from '../database/services/workspace.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';
import { UnitDownloadClass } from './unit-download.class';
import { UnitService } from '../database/services/unit.service';
import { VeronaModulesService } from '../database/services/verona-modules.service';
import {SettingService} from "../database/services/setting.service";

@Controller('workspace/:workspace_id')
export class WorkspaceController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService,
    private veronaModuleService: VeronaModulesService,
    private settingService: SettingService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: WorkspaceFullDto
  })
  @ApiTags('workspace')
  async find(@WorkspaceId() workspaceId: number): Promise<WorkspaceFullDto> {
    return this.workspaceService.findOne(workspaceId);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
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
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="studio-export-units.zip"')
  @Header('Cache-Control', 'none')
  @Header('Content-Type', 'application/zip')
  @ApiTags('workspace')
  async downloadUnitsZip(@WorkspaceId() workspaceId: number,
                         @Param('settings') unitDownloadSettingsString: string
  ): Promise<StreamableFile> {
    const unitDownloadSettings = JSON.parse(unitDownloadSettingsString);
    const file = await UnitDownloadClass.get(
      this.workspaceService,
      this.unitService,
      this.veronaModuleService,
      this.settingService,
      workspaceId,
      unitDownloadSettings
    );
    return new StreamableFile(file);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace')
  async patchSettings(@WorkspaceId() workspaceId: number,
                      @Body() workspaceSetting: WorkspaceSettingsDto) {
    return this.workspaceService.patchSettings(workspaceId, workspaceSetting);
  }
}
