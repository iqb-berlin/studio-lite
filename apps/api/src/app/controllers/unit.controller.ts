import {
  Body, Controller, Delete, Get, Param, ParseArrayPipe, ParseBoolPipe, ParseIntPipe, Patch, Post, Query, Req, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiParam, ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  CreateUnitDto, MoveToDto, UnitDefinitionDto, UnitInListDto, UnitMetadataDto, UnitSchemeDto
} from '@studio-lite-lib/api-dto';
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

@Controller('workspaces/:workspace_id/units')
export class UnitController {
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
  @ApiCreatedResponse({
    type: [UnitMetadataDto]
  })
  @ApiTags('workspace unit')
  async findAllWithMetadata(@WorkspaceId() workspaceId: number): Promise<UnitMetadataDto[]> {
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

  @Patch('move')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, DeleteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async moveUnits(@Body('units') units: number[],
    @User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Body('targetWorkspace', ParseIntPipe) targetWorkspace: number) {
    return this.unitService.patchWorkspace(units, targetWorkspace, user, workspaceId, 'moveTo');
  }

  @Patch('submit')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchDropBoxHistory(@User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Body() body: MoveToDto) {
    return this.unitService.patchDropBoxHistory(body.ids, body.targetId, workspaceId, user);
  }

  @Patch('return_submitted_units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchReturnDropBoxHistory(@User() user: UserEntity,
    @Param('workspace_id', ParseIntPipe) workspaceId: number,
    @Body('units') units: number[]) {
    return this.unitService.patchReturnDropBoxHistory(units, workspaceId, user);
  }

  @Post('copy')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async copyUnits(@Body('units') units: number[],
    @User() user: UserEntity,
    @Body('addComments', ParseBoolPipe) addComments: boolean,
    @Body('targetWorkspace', ParseIntPipe) targetWorkspace: number) {
    return this.unitService.copy(units, targetWorkspace, user, addComments);
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
  @ApiCreatedResponse({
    description: 'Sends back the id of the new unit in database',
    type: Number
  })
  @ApiTags('workspace unit')
  async create(@WorkspaceId() workspaceId: number,
    @User() user: UserEntity,
    @Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(workspaceId, createUnitDto, user, false);
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

  @Delete(':id/state')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WriteAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async deleteUnitState(@Param('id', ParseIntPipe) unitId: number,
    @User() user: UserEntity) {
    return this.unitService.removeUnitState(unitId, user);
  }
}
