import {
  Body,
  Controller,
  Delete,
  Get, Header,
  Param,
  ParseArrayPipe,
  ParseBoolPipe,
  ParseIntPipe,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  Req,
  StreamableFile,
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
  ApiForbiddenResponse
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
  UnitDefinitionSummaryDto,
  UnitFullMetadataDto,
  UnitInListDto,
  UnitExportContentsDto,
  UnitMetadataValues,
  UnitPropertiesDto,
  UnitSchemeDto
} from '@studio-lite-lib/api-dto';
import { UnitService } from '../services/unit.service';
import { UnitMetadataService } from '../services/unit-metadata.service';
import { UnitDefinitionService } from '../services/unit-definition.service';
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
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitRichNoteService } from '../services/unit-rich-note.service';
import { findUnitExportContents } from '../utils/unit-export-contents';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { UnitsInWorkspaceGuard } from '../guards/units-in-workspace.guard';
import { QueryUnitsInWorkspaceGuard } from '../guards/query-units-in-workspace.guard';
import { CopySourcesAccessibleGuard } from '../guards/copy-sources-accessible.guard';
import { MoveTargetAccessGuard } from '../guards/move-target-access.guard';
import { DropBoxTargetGuard } from '../guards/drop-box-target.guard';
import { isCopyBody, isSubmissionBody } from '../utils/unit-request-body';

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
 * The guards mostly rise with what a route does: reading takes access to the workspace, changing a
 * unit takes write access, grouping takes manage access, and moving units to another workspace or
 * deleting them takes the top level. Two routes step out of that order: deleting a single unit is
 * the group admin's, and submitting units to a drop box ({@link patchDropBoxHistory}) moves them
 * out of the workspace on nothing more than comment access -- but only into the drop box set for
 * the workspace ({@link DropBoxTargetGuard}).
 *
 * Those guards ask about the workspace of the path alone. That the units are in it is asked first,
 * by {@link UnitInWorkspaceGuard} for the unit in the path, by {@link UnitsInWorkspaceGuard} for
 * the units of the body and by {@link QueryUnitsInWorkspaceGuard} for the units deleted through the
 * query (#1775). The report that takes units from the query (`coding-book`) carries no such guard:
 * it reads the units of the workspace and drops any other id.
 *
 * Where units cross into another workspace, that one is asked about as well: the target of a move
 * ({@link MoveTargetAccessGuard}, #1780), and the sources a copy takes its units from -- its path
 * names the target ({@link CopySourcesAccessibleGuard}, #1779).
 */
@Controller('workspaces/:workspace_id/units')
export class WorkspaceUnitController {
  constructor(
    private unitService: UnitService,
    private unitMetadataService: UnitMetadataService,
    private unitDefinitionService: UnitDefinitionService,
    private workspaceService: WorkspaceService,
    private settingsService: SettingService,
    private unitCommentService: UnitCommentService,
    private unitRichNoteService: UnitRichNoteService
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
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
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
  @ApiQuery({ name: 'trainingRequirement', required: false, enum: ['all', 'required', 'not-required'] })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
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
    @Query('codeLabelToUpper', new ParseBoolPipe()) codeLabelToUpper: boolean,
    @Query('trainingRequirement', new ParseEnumPipe(
      { ALL: 'all', REQUIRED: 'required', NOT_REQUIRED: 'not-required' },
      { optional: true }
    ))
                   trainingRequirement?: CodeBookContentSetting['trainingRequirement']
  ) {
    const options:CodeBookContentSetting = {
      exportFormat,
      trainingRequirement: trainingRequirement || 'all',
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
   * The properties of the workspace's units. The metadata report over them is built by the interface
   * from its table, in its own language (#2181).
   */
  @Get('properties')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async findAllWithProperties(@WorkspaceId() workspaceId: number): Promise<UnitPropertiesDto[]> {
    return this.unitService.findAllWithProperties(workspaceId);
  }

  /**
   * For every unit of the workspace, which optional export files it would fill -- metadata, items,
   * coding scheme, comments, rich notes. The export dialog offers a file only when one of the chosen
   * units has content for it.
   */
  @Get('export-contents')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ type: [UnitExportContentsDto] })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiTags('workspace unit')
  async findExportContents(@WorkspaceId() workspaceId: number): Promise<UnitExportContentsDto[]> {
    return findUnitExportContents(
      workspaceId,
      this.unitService,
      this.unitCommentService,
      this.unitRichNoteService
    );
  }

  @Get(':unit_id/properties')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiNotFoundResponse()
  @ApiTags('workspace unit')
  async findOnesProperties(
    @Param('workspace_id', ParseIntPipe) workspaceId: number, @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitPropertiesDto> {
    return this.unitService.findOnesPropertiesWithoutMetadata(unitId, workspaceId);
  }

  @Get(':unit_id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async findOnesMetadata(
    @Param('workspace_id', ParseIntPipe) workspaceId: number, @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitFullMetadataDto> {
    return this.unitMetadataService.findOnesCurrentMetadata(unitId, workspaceId);
  }

  /**
   * Writes the unit's metadata, its profiles and its items, and answers them as stored, the items it
   * created with their uuids (#2200).
   */
  @Patch(':unit_id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ type: UnitFullMetadataDto })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async patchOnesMetadata(
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Param('unit_id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() metadata: UnitMetadataValues
  ): Promise<UnitFullMetadataDto> {
    return this.unitMetadataService.patchMetadataOfUnit(
      unitId,
      workspaceId,
      metadata,
      await this.unitService.getDisplayNameForUser(user.id)
    );
  }

  @Get(':unit_id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace unit')
  async findOnesDefinition(
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionDto> {
    return this.unitDefinitionService.findOnesDefinition(unitId);
  }

  /** Whether the unit has a definition, its format, size and dependencies -- without the definition (#2135). */
  @Get(':unit_id/definition-summary')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ type: UnitDefinitionSummaryDto })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace unit')
  async findOnesDefinitionSummary(
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitDefinitionSummaryDto> {
    return this.unitDefinitionService.findOnesDefinitionSummary(unitId);
  }

  @Get(':unit_id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async findOnesScheme(
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitDefinitionService.findOnesScheme(unitId);
  }

  /**
   * Writes the unit's properties; a body with metadata is refused, they have a route of their own
   * (#2200). The user's display name is resolved here because it is stored on the unit as "last
   * changed by" -- the unit keeps the name, not the id.
   */
  @Patch(':unit_id/properties')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchUnitProperties(@Param('unit_id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitProperties: UnitPropertiesDto) {
    return this.unitService.patchUnit(unitId, unitProperties, await this.unitService.getDisplayNameForUser(user.id));
  }

  @Patch('workspace-id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitsInWorkspaceGuard, DeleteAccessGuard, MoveTargetAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Unit moved' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace or in the target workspace.' })
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
   * the move in {@link UnitDropBoxHistory}. A unit that cannot be returned -- never submitted, or
   * submitted from a workspace now in another group (#2027) -- stays where it is and is named in
   * the answer.
   */
  @Patch('drop-box-history')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitsInWorkspaceGuard, CommentAccessGuard, DropBoxTargetGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Units moved; those that could not be returned are named in the report.' })
  @ApiForbiddenResponse({
    description: 'No privileges in the workspace, or the target is not its drop box. A drop box in another group ' +
      'counts as none.'
  })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit')
  async patchDropBoxHistory(@User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Body() body: MoveToDto | IdArrayDto) {
    if (isSubmissionBody(body)) {
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

  @Patch(':unit_id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchDefinition(@Param('unit_id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitDefinitionDto: UnitDefinitionDto) {
    return this.unitDefinitionService.patchDefinition(
      unitId,
      unitDefinitionDto,
      await this.unitService.getDisplayNameForUser(user.id),
      new Date());
  }

  @Patch(':unit_id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchScheme(@Param('unit_id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitSchemeDto: UnitSchemeDto) {
    return this.unitDefinitionService.patchScheme(
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
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard, CopySourcesAccessibleGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({ description: 'Unit created' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiNotFoundResponse({ description: 'A unit to copy from is not found in a workspace the user can enter.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  @ApiTags('workspace unit')
  async create(
    @WorkspaceId() workspaceId: number,
    @Body() body: CreateUnitDto | CopyUnitDto,
    @User() user: UserEntity
  ) {
    if (isCopyBody(body)) {
      return this.unitService.copy(body.ids, workspaceId, user, body.addComments);
    }
    return this.unitService.create(workspaceId, body, user, false);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, QueryUnitsInWorkspaceGuard, DeleteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
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
  @Delete(':unit_id')
  @UseGuards(JwtAuthGuard, IsWorkspaceGroupAdminGuard, UnitInWorkspaceGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  @ApiOkResponse()
  @ApiForbiddenResponse({ description: 'No admin privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error.' })
  async removeUnit(
    @Param('unit_id', ParseIntPipe) unitId: number
  ): Promise<void> {
    return this.unitService.remove(unitId);
  }
}
