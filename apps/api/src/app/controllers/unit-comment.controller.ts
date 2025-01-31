import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  CreateUnitCommentDto,
  UnitCommentDto,
  UpdateUnitCommentDto,
  UpdateUnitUserDto
} from '@studio-lite-lib/api-dto';
import { UnitCommentService } from '../services/unit-comment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { CommentAccessGuard } from '../guards/comment-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { CommentWriteGuard } from '../guards/comment-write.guard';
import { UnitUserService } from '../services/unit-user.service';

@Controller('workspaces/:workspace_id/units/:unit_id/comments')
export class UnitCommentController {
  constructor(
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiTags('workspace unit')
  async findOnesComments(@Param('unit_id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId);
  }

  @Get('last-seen')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'User\'s last seen timestamp for comments of this unit.' })
  @ApiTags('workspace unit')
  async findLastSeenTimestamp(@Req() request, @Param('unit_id', ParseIntPipe) unitId: number): Promise<Date> {
    return this.unitUserService.findLastSeenCommentTimestamp(request.user.id, unitId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Register changed timestamp of the last seen comment' })
  @ApiTags('workspace unit')
  async patchOnesUnitUserLastSeen(
    @Param('unit_id', ParseIntPipe) unitId: number,
      @Body() updateUnitUser: UpdateUnitUserDto
  ): Promise<void> {
    return this.unitUserService.patchUnitUserCommentsLastSeen(unitId, updateUnitUser);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiTags('workspace unit')
  async createComment(@Body() createUnitCommentDto: CreateUnitCommentDto) {
    return this.unitCommentService.createComment(createUnitCommentDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentWriteGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('workspace unit')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  // todo CommentDeleteGuard: but include workspacegroupadmin
  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('workspace unit')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }
}
