import {
  Controller, Get, Header, Param, ParseBoolPipe, Query, StreamableFile, UseFilters, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CodeBookContentSetting } from '@studio-lite-lib/api-dto';
import { HttpExceptionFilter } from '../exceptions/http-exception.filter';
import { WorkspaceService } from '../services/workspace.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGroupId } from '../decorators/workspace-group.decorator';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { UnitService } from '../services/unit.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';
import { IsAdminGuard } from '../guards/is-admin.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { SettingService } from '../services/setting.service';

@Controller('download')
@UseFilters(HttpExceptionFilter)
export class DownloadController {
  constructor(
    private workspaceService: WorkspaceService,
    private unitService: UnitService,
    private settingsService: SettingService
  ) {
  }

  @Get('docx/workspaces/:workspace_group_id/coding-book/:unitList')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-coding-book.docx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  @ApiTags('download')

  async downloadCodingBook(
  @WorkspaceGroupId() workspaceGroupId: number,
    @Param('unitList') unitList: string,
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
        workspaceGroupId,
        this.unitService,
        this.settingsService,
        options,
        unitList);
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/workspaces/:workspace_group_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-workspace-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxWorkspacesByGroup(@WorkspaceGroupId() workspaceGroupId: number) {
    const file = await DownloadWorkspacesClass.getWorkspaceReport(
      this.workspaceService, this.unitService, workspaceGroupId
    );
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/workspaces')
  @UseGuards(JwtAuthGuard, IsAdminGuard)
  @ApiBearerAuth()
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-workspace-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxWorkspaces() {
    const file = await DownloadWorkspacesClass.getWorkspaceReport(
      this.workspaceService, this.unitService, 0
    );
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/unit-metadata-items/:workspace_id/:selection')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-unit-metadata-items-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxItemsMetadata(@Param('workspace_id') workspaceId: number, @Param('selection') selection: string) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      'items', this.unitService, workspaceId, selection);
    return new StreamableFile(file as Buffer);
  }

  @Get('xlsx/unit-metadata/:workspace_id/:selection')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-unit-metadata-report.xlsx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiTags('download')
  async downloadXlsxUnitsMetadata(@Param('workspace_id') workspaceId: number, @Param('selection') selection: string) {
    const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
      'units', this.unitService, workspaceId, selection);
    return new StreamableFile(file as Buffer);
  }
}
