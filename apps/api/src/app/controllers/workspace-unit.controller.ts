import {
  Body,
  Controller,
  Delete,
  Get, Header,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res, StreamableFile,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  CodeBookContentSetting,
  CodingReportDto,
  CopyUnitDto,
  CreateUnitDto,
  IdArrayDto,
  MoveToDto,
  NewNameDto,
  UnitDefinitionDto,
  UnitFullMetadataDto,
  UnitInListDto,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import type { Response } from 'express';
import { UnitService } from '../services/unit.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { WorkspaceId } from '../decorators/workspace.decorator';
import { AppVersionGuard } from '../guards/app-version.guard';
import { WriteAccessGuard } from '../guards/write-access.guard';
import { DeleteAccessGuard } from '../guards/delete-access.guard';
import { User } from '../decorators/user.decorator';
import UserEntity from '../entities/user.entity';
import { CommentAccessGuard } from '../guards/comment-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { ManageAccessGuard } from '../guards/manage-access.guard';
import { DownloadWorkspacesClass } from '../classes/download-workspaces.class';
import { WorkspaceService } from '../services/workspace.service';
import { SettingService } from '../services/setting.service';
import { IsWorkspaceGroupAdminGuard } from '../guards/is-workspace-group-admin.guard';

/**
 * `workspaces/:workspace_id/units` -- the largest surface of the API: the units of a workspace,
 * each part of them addressable on its own (properties, definition, scheme, metadata), plus what
 * is done to them as a set -- moving them to another workspace, submitting them to a drop box,
 * grouping them, and the coding report and coding book over them.
 *
 * The parts are separate routes because they are read and written separately: a unit list needs the
 * properties and nothing else, while the definition is the large part nobody wants along by
 * accident.
 *
 * The guards rise with what a route does: reading takes access to the workspace, changing a unit
 * takes write access, grouping takes manage access, and moving or deleting takes the top level --
 * with one exception, deleting a single unit, which is the group admin's.
 */
@Controller('workspaces/:workspace_id/units')
export class WorkspaceUnitController {
  constructor(
    private unitService: UnitService,
    private workspaceService: WorkspaceService,
    private settingsService: SettingService
  ) {}

  /**
   * The units of the workspace, in the shape the list needs. The queries add what only some views
   * want: the timestamp of the comments each reader has already seen, and the drop-box relation to
   * another workspace -- `targetWorkspaceId` adds it, and `filterTargetWorkspaceId` then keeps
   * only the units submitted to this workspace, which is what a drop box shows.
   */
  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiTags('workspace unit')
  async findAll(
    @Req() request,
      @WorkspaceId(ParseIntPipe) workspaceId: number,
      @Query('filterTargetWorkspaceId', new ParseBoolPipe({ optional: true }))
           filterTargetWorkspaceId: boolean,
      @Query('withLastSeenCommentTimeStamp', new ParseBoolPipe({ optional: true }))
           withLastSeenCommentTimeStamp: boolean,
      @Query('targetWorkspaceId', new ParseIntPipe({ optional: true }))
           targetWorkspaceId: number):
      Promise<UnitInListDto[]> {
    return this.unitService.findAllForWorkspace(
      workspaceId,
      request.user.id,
      withLastSeenCommentTimeStamp,
      targetWorkspaceId,
      filterTargetWorkspaceId);
  }

  @Get('scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiTags('workspace unit')
  @ApiParam({
    name: 'workspace_id',
    type: Number,
    description: 'ID of the workspace for which the coding report is to be retrieved.'
  })
  @ApiOkResponse({
    description: 'Successfully retrieves the coding report.',
    type: [CodingReportDto]
  })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  async getCodingReport(
    @WorkspaceId(ParseIntPipe) workspaceId: number
  ): Promise<CodingReportDto[]> {
    return this.workspaceService.getCodingReport(workspaceId);
  }

  /**
   * The coding book over the units named in `id`, as docx or json. The many boolean queries are
   * the content settings the dialog offers -- which variables and which parts of a coding scheme
   * end up in the document -- and are gathered into one settings object here.
   */
  @Get('coding-book')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @Header('Content-Disposition', 'attachment; filename="iqb-studio-coding-book.docx"')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  @ApiTags('workspace unit')
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
    return new StreamableFile(file as unknown as Uint8Array);
  }

  /**
   * The properties of the workspace's units -- or, for `type` `unit` or `item`, the xlsx metadata
   * report over them, narrowed to the given units and metadata columns. Two answers on one route:
   * the report is the same data in a form to hand on.
   */
  @Get('properties')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiQuery({
    name: 'column',
    type: String,
    isArray: true,
    required: false
  })
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: false
  })
  @ApiQuery({
    name: 'type',
    type: String
  })
  @ApiTags('workspace unit')
  async findAllWithProperties(
    @WorkspaceId() workspaceId: number,
      @Query('column') columns: string[],
      @Query('id') units: number[],
      @Query('type') type: string,
      @Res({ passthrough: true }) res: Response
  ): Promise<UnitPropertiesDto[] | StreamableFile> {
    if (type === 'unit' || type === 'item') {
      const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
        type, this.unitService, workspaceId, [columns].flat(), [units].flat());
      const filename = type === 'unit' ?
        'iqb-studio-unit-metadata-report.xlsx' : 'iqb-studio-unit-metadata-items-report.xlsx';
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      return new StreamableFile(file as unknown as Uint8Array);
    }
    return this.unitService.findAllWithProperties(workspaceId);
  }

  @Get(':id/properties')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiNotFoundResponse()
  @ApiTags('workspace unit')
  async findOnesProperties(
    @Param('workspace_id', ParseIntPipe) workspaceId: number, @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitPropertiesDto> {
    return this.unitService.findOnesProperties(unitId, workspaceId);
  }

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async findOnesMetadata(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitFullMetadataDto> {
    return this.unitService.findOnesMetadata(unitId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace unit')
  async findOnesDefinition(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitService.findOnesDefinition(unitId);
  }

  @Get(':id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async findOnesScheme(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }

  /**
   * Writes the unit's properties, and its metadata along with them when the body carries any. The
   * user's display name is resolved here because it is stored on the unit as "last changed by" --
   * the unit keeps the name, not the id.
   */
  @Patch(':id/properties')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchUnitProperties(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitProperties: UnitPropertiesDto) {
    return this.unitService.patchUnit(unitId, unitProperties, await this.unitService.getDisplayNameForUser(user.id));
  }

  @Patch('workspace-id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, DeleteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Unit moved' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async moveUnits(@Body() body: MoveToDto,
    @User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number) {
    return this.unitService.patchWorkspace(body.ids, body.targetId, user, workspaceId, 'moveTo');
  }

  /**
   * Submits units to a drop box, or sends submitted ones back -- which of the two follows from the
   * body: with a `targetId` it is a submission, without it a return. Both move the units and record
   * the move in {@link UnitDropBoxHistory}.
   */
  @Patch('drop-box-history')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Unit moved' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async patchDropBoxHistory(@User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Body() body: MoveToDto | IdArrayDto) {
    if ('targetId' in body) {
      return this.unitService.patchDropBoxHistory(body.ids, body.targetId, workspaceId, user);
    }
    return this.unitService.patchReturnDropBoxHistory(body.ids, workspaceId, user);
  }

  @Patch('group-name')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, ManageAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  @ApiOkResponse({ description: 'Unit group name changed' })
  async patchUnitsGroup(
  @WorkspaceId() workspaceId: number,
    @Body() body: NewNameDto
  ) {
    return this.unitService
      .patchUnitGroup(workspaceId, body.name, body.ids);
  }

  @Patch(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchDefinition(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitDefinitionDto: UnitDefinitionDto) {
    return this.unitService.patchDefinition(
      unitId,
      unitDefinitionDto,
      await this.unitService.getDisplayNameForUser(user.id),
      new Date());
  }

  @Patch(':id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchScheme(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitSchemeDto: UnitSchemeDto) {
    return this.unitService.patchScheme(
      unitId,
      unitSchemeDto,
      await this.unitService.getDisplayNameForUser(user.id),
      new Date());
  }

  /**
   * Creates a unit, or copies existing ones -- which of the two follows from the body: a body that
   * says whether to take the comments along is a copy.
   */
  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({ description: 'Unit created' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace unit')
  async create(
  @WorkspaceId() workspaceId: number,
    @Body() body: CreateUnitDto | CopyUnitDto,
    @User() user: UserEntity
  ) {
    if ('addComments' in body) {
      return this.unitService.copy(body.ids, workspaceId, user, body.addComments);
    }
    return this.unitService.create(workspaceId, body, user, false);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, DeleteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiQuery({
    name: 'id',
    type: Number,
    isArray: true,
    required: true
  })
  async remove(
    @Query('id', new ParseArrayPipe({ items: Number, separator: ',' })) ids: number[]
  ): Promise<void> {
    return this.unitService.remove(ids);
  }

  /**
   * Deletes a single unit. Unlike {@link remove}, which takes delete access in the workspace, this
   * one is for the group admin, who has no access level in it.
   */
  @Delete(':unitId')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  @ApiOkResponse()
  @ApiUnauthorizedResponse({ description: 'No admin privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  async removeUnit(
    @Param('unitId', ParseIntPipe) unitId: number
  ): Promise<void> {
    return this.unitService.remove(unitId);
  }
}
