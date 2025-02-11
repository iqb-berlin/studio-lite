import {
  Body,
  Controller,
  Delete,
  Get,
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
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  CopyUnitDto,
  CreateUnitDto, IdArrayDto, MoveToDto, NewNameDto, UnitDefinitionDto, UnitInListDto, UnitMetadataDto, UnitSchemeDto
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

@Controller('workspaces/:workspace_id/units')
export class WorkspaceUnitController {
  constructor(
    private unitService: UnitService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [UnitInListDto]
  })
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

  @Get('metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse()
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
  async findAllWithMetadata(
    @WorkspaceId() workspaceId: number,
      @Query('column') columns: string[],
      @Query('id') units: number[],
      @Query('type') type: string,
      @Res({ passthrough: true }) res: Response
  ): Promise<UnitMetadataDto[] | StreamableFile> {
    if (type === 'unit' || type === 'item') {
      const file = await DownloadWorkspacesClass.getWorkspaceMetadataReport(
        type, this.unitService, workspaceId, [columns].flat(), [units].flat());
      const filename = type === 'unit' ?
        'iqb-studio-unit-metadata-report.xlsx' : 'iqb-studio-unit-metadata-items-report.xlsx';
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      return new StreamableFile(file as Buffer);
    }
    return this.unitService.findAllWithMetadata(workspaceId);
  }

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitMetadataDto
  })
  @ApiTags('workspace unit')
  async findOnesMetadata(
    @Param('workspace_id', ParseIntPipe) workspaceId: number, @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitMetadataDto> {
    return this.unitService.findOnesMetadata(unitId, workspaceId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitDefinitionDto
  })
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
  @ApiCreatedResponse({
    type: UnitSchemeDto
  })
  @ApiTags('workspace unit')
  async findOnesScheme(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }

  @Patch(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchMetadata(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitMetadataDto: UnitMetadataDto) {
    return this.unitService.patchMetadata(unitId, unitMetadataDto, user);
  }

  @Patch('workspace-id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, DeleteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Unit moved' })
  @ApiTags('workspace unit')
  async moveUnits(@Body() body: MoveToDto,
    @User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number) {
    return this.unitService.patchWorkspace(body.ids, body.targetId, user, workspaceId, 'moveTo');
  }

  @Patch('drop-box-history')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Unit moved' })
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
  @ApiTags('workspace unit')
  async patchDefinition(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitDefinitionDto: UnitDefinitionDto) {
    return this.unitService.patchDefinition(unitId, unitDefinitionDto, user);
  }

  @Patch(':id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchScheme(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity,
    @Body() unitSchemeDto: UnitSchemeDto) {
    return this.unitService.patchScheme(unitId, unitSchemeDto, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({ description: 'Unit created' })
  @ApiTags('workspace unit')
  async create(
  @WorkspaceId() workspaceId: number,
    @Body() body: CreateUnitDto | CopyUnitDto,
    @User() user: UserEntity
  ) {
    if ('targetId' in body) {
      return this.unitService.copy(body.ids, body.targetId, user, body.addComments);
    }
    return this.unitService.create(workspaceId, body, user, false);
  }

  @Delete()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, DeleteAccessGuard)
  @ApiBearerAuth()
  @ApiTags('workspace unit')
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
}
