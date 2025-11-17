import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags, ApiUnauthorizedResponse
} from '@nestjs/swagger';
import {
  CreateUnitCommentDto,
  UnitCommentDto,
  UpdateUnitCommentDto, UpdateUnitCommentUnitItemsDto, UpdateUnitCommentVisibilityDto,
  UpdateUnitUserDto
} from '@studio-lite-lib/api-dto';
import { UnitCommentService } from '../services/unit-comment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { CommentAccessGuard } from '../guards/comment-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { CommentWriteGuard } from '../guards/comment-write.guard';
import { UnitUserService } from '../services/unit-user.service';
import { ItemCommentService } from '../services/item-comment.service';
import { UnitId } from '../decorators/unit-id.decorator';

@Controller('workspaces/:workspace_id/units/:unit_id/comments')
export class WorkspaceUnitCommentController {
  constructor(
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService,
    private itemCommentService: ItemCommentService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async findOnesComments(@Param('unit_id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId);
  }

  @Get('last-seen')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'User\'s last seen timestamp for comments of this unit.' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async findLastSeenTimestamp(@Req() request, @Param('unit_id', ParseIntPipe) unitId: number): Promise<Date> {
    return this.unitUserService.findLastSeenCommentTimestamp(request.user.id, unitId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Register changed timestamp of the last seen comment' })
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
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
  @ApiUnauthorizedResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
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
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Patch(':comment_id/items')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard, CommentWriteGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Comment item connections for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment item connections not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment item connections.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  async patchCommentItems(@Param('comment_id', ParseIntPipe) commentId: number,
    @UnitId() unitId: number,
    @Body() comment: UpdateUnitCommentUnitItemsDto) {
    return this.itemCommentService.updateCommentItems(unitId, commentId, comment.unitItemUuids);
  }

  // todo CommentDeleteGuard: but include workspacegroupadmin
  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete comment.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }

  @Patch(':comment_id/hidden')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('review unit comment')
  async patchCommentVisibility(@Param('comment_id', ParseIntPipe) id: number,
    @Body() comment: UpdateUnitCommentVisibilityDto) {
    return this.unitCommentService.patchCommentVisibility(id, comment);
  }
}
