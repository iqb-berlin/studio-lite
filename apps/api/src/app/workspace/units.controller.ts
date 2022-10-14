import {
  Body, Controller, Delete, Get, Logger, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiTags
} from '@nestjs/swagger';
import {
  CreateUnitDto, UnitDefinitionDto, UnitInListDto, UnitMetadataDto, UnitSchemeDto,
  UnitCommentDto, CreateUnitCommentDto, UpdateUnitCommentDto, UpdateUnitUserDto
} from '@studio-lite-lib/api-dto';
import { ApiImplicitParam } from '@nestjs/swagger/dist/decorators/api-implicit-param.decorator';
import { ApiUnauthorizedResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { UnitService } from '../database/services/unit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceGuard } from './workspace.guard';
import { WorkspaceId } from './workspace.decorator';
import { CommentWriteGuard } from './comment-write.guard';
import { CommentDeleteGuard } from './comment-delete.guard';
import { UnitUserService } from '../database/services/unit-user.service';
import { UnitCommentService } from '../database/services/unit-comment.service';
import { AppVersionGuard } from '../app-version.guard';

@Controller('workspace/:workspace_id')
export class UnitsController {
  private readonly logger = new Logger(UnitService.name);
  constructor(
    private unitService: UnitService,
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService
  ) {}

  @Get('units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, AppVersionGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [UnitInListDto]
  })
  @ApiQuery({
    name: 'withLastSeenCommentTimeStamp',
    type: Boolean
  })
  @ApiTags('workspace')
  async findAll(
    @Req() request,
      @WorkspaceId() workspaceId: number,
      @Query('withLastSeenCommentTimeStamp') withLastSeenCommentTimeStamp): Promise<UnitInListDto[]> {
    return this.unitService.findAll(workspaceId, request.user.id, withLastSeenCommentTimeStamp);
  }

  @Get('units/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: [UnitMetadataDto]
  })
  @ApiTags('workspace')
  async findAllWithMetadata(@WorkspaceId() workspaceId: number): Promise<UnitMetadataDto[]> {
    return this.unitService.findAllWithMetadata(workspaceId);
  }

  @Get(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitMetadataDto
  })
  @ApiTags('workspace unit')
  async findOnesMetadata(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitMetadataDto> {
    return this.unitService.findOnesMetadata(unitId);
  }

  @Get(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
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
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    type: UnitSchemeDto
  })
  @ApiTags('workspace unit')
  async findOnesScheme(
    @Param('id', ParseIntPipe) unitId: number
  ): Promise<UnitSchemeDto> {
    return this.unitService.findOnesScheme(unitId);
  }

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiTags('workspace unit')
  async findOnesComments(@Param('id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId);
  }

  @Get(':id/comments/last-seen')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'User\'s last seen timestamp for comments of this unit.' })
  @ApiTags('workspace unit')
  async findLastSeenTimestamp(@Req() request, @Param('id', ParseIntPipe) unitId: number): Promise<Date> {
    return this.unitUserService.findLastSeenCommentTimestamp(request.user.id, unitId);
  }

  @Patch(':id/comments')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Register changed timestamp of the last seen comment' })
  @ApiTags('workspace unit')
  async patchOnesUnitUserLastSeen(
    @Param('id', ParseIntPipe) unitId: number,
      @Body() updateUnitUser: UpdateUnitUserDto
  ): Promise<void> {
    return this.unitUserService.patchUnitUserCommentsLastSeen(unitId, updateUnitUser);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiTags('workspace unit')
  async createComment(@Body() createUnitCommentDto: CreateUnitCommentDto) {
    return this.unitCommentService.createComment(createUnitCommentDto);
  }

  @Patch(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentWriteGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('workspace unit')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Delete(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentDeleteGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('workspace unit')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }

  @Patch(':id/metadata')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchMetadata(@Param('id', ParseIntPipe) unitId: number,
    @Body() unitMetadataDto: UnitMetadataDto) {
    return this.unitService.patchMetadata(unitId, unitMetadataDto);
  }

  @Patch(':ids/moveto/:target')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchWorkspace(@Param('ids') ids: string,
    @Param('target', ParseIntPipe) targetWorkspaceId: number) {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.unitService.patchWorkspace(idsAsNumberArray, targetWorkspaceId);
  }

  @Patch(':ids/copyto/:target')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async copy(@Param('ids') ids: string,
    @Param('target', ParseIntPipe) targetWorkspaceId: number) {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.unitService.copy(idsAsNumberArray, targetWorkspaceId);
  }

  @Patch(':id/definition')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchDefinition(@Param('id', ParseIntPipe) unitId: number,
    @Body() unitDefinitionDto: UnitDefinitionDto) {
    return this.unitService.patchDefinition(unitId, unitDefinitionDto);
  }

  @Patch(':id/scheme')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiTags('workspace unit')
  async patchScheme(@Param('id', ParseIntPipe) unitId: number,
    @Body() unitSchemeDto: UnitSchemeDto) {
    return this.unitService.patchScheme(unitId, unitSchemeDto);
  }

  @Post('units')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiImplicitParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new unit in database',
    type: Number
  })
  @ApiTags('workspace unit')
  async create(@WorkspaceId() workspaceId: number,
    @Body() createUnitDto: CreateUnitDto) {
    return this.unitService.create(workspaceId, createUnitDto);
  }

  @Delete(':ids')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  @ApiBearerAuth()
  @ApiTags('workspace unit')
  async remove(@WorkspaceId() workspaceId: number,
    @Param('ids') ids: string): Promise<void> {
    const idsAsNumberArray: number[] = [];
    ids.split(';').forEach(s => idsAsNumberArray.push(parseInt(s, 10)));
    return this.unitService.remove(idsAsNumberArray);
  }
}
