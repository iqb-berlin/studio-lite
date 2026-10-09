import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req, UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags, ApiForbiddenResponse
} from '@nestjs/swagger';
import {
  CreateUnitCommentDto,
  UnitCommentDto,
  UpdateUnitCommentDto, UpdateUnitCommentUnitItemsDto, UpdateUnitCommentVisibilityDto,
  UpdateUnitUserDto, UnitCommentVoteDto, UnitCommentVoterDto
} from '@studio-lite-lib/api-dto';
import { UnitCommentService } from '../services/unit-comment.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { CommentAccessGuard } from '../guards/comment-access.guard';
import { WorkspaceAccessGuard } from '../guards/workspace-access.guard';
import { CommentWriteGuard } from '../guards/comment-write.guard';
import { CommentDeleteGuard } from '../guards/comment-delete.guard';
import { CommentInUnitGuard } from '../guards/comment-in-unit.guard';
import { UnitInWorkspaceGuard } from '../guards/unit-in-workspace.guard';
import { UnitUserService } from '../services/unit-user.service';
import { ItemCommentService } from '../services/item-comment.service';
import { UnitId } from '../decorators/unit-id.decorator';
import { UsersService } from '../services/users.service';

/**
 * `workspaces/:workspace_id/units/:unit_id/comments` -- the discussion on a unit from inside its
 * workspace: reading it, writing and revising comments, tying one to single items, voting, and the
 * timestamp of what the reader has already seen, which the "new comments" marking is built on.
 *
 * Most of it takes the comment access level ({@link CommentAccessGuard}); reading the last-seen
 * timestamp settles for plain access to the workspace, since it says nothing about the comments
 * themselves.
 *
 * Changing a comment or its items is left to its author ({@link CommentWriteGuard}), deleting it
 * to its author and the workspace's administrators ({@link CommentDeleteGuard}).
 *
 * The path is held to what it names. Every route first asks {@link UnitInWorkspaceGuard} whether
 * the unit is in the workspace -- the guards about access ask about the workspace alone, so
 * without it the discussion of any unit was open from any workspace the caller is in. Every route
 * on a single comment then asks {@link CommentInUnitGuard}, last, whether the comment belongs to
 * the unit. Either way a mismatch is answered with a 404.
 *
 * Who writes is the token's user, not whoever the body names (#1776): a new comment is signed with
 * the caller's id and name, and the last-seen timestamp is the caller's own.
 */
@Controller('workspaces/:workspace_id/units/:unit_id/comments')
export class WorkspaceUnitCommentController {
  constructor(
    private unitUserService: UnitUserService,
    private unitCommentService: UnitCommentService,
    private itemCommentService: ItemCommentService,
    private usersService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async findOnesComments(@Req() request, @Param('unit_id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId, request.user.id);
  }

  @Get('last-seen')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, WorkspaceAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'User\'s last seen timestamp for comments of this unit.' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async findLastSeenTimestamp(@Req() request, @Param('unit_id', ParseIntPipe) unitId: number): Promise<Date> {
    return this.unitUserService.findLastSeenCommentTimestamp(request.user.id, unitId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Register changed timestamp of the last seen comment' })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async patchOnesUnitUserLastSeen(
    @Req() request,
    @Param('unit_id', ParseIntPipe) unitId: number,
    @Body() updateUnitUser: UpdateUnitUserDto
  ): Promise<void> {
    return this.unitUserService.patchUnitUserCommentsLastSeen(
      unitId,
      request.user.id,
      updateUnitUser.lastSeenCommentChangedAt
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentAccessGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiForbiddenResponse({ description: 'No privileges in the workspace.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async createComment(
    @Req() request,
    @Param('unit_id', ParseIntPipe) unitId: number,
    @Body() createUnitCommentDto: CreateUnitCommentDto
  ) {
    // The unit is the one of the path, which UnitInWorkspaceGuard has held to the workspace, and
    // the author the token's user. The body's unitId, userId and userName used to be saved as sent.
    const author = await this.usersService.commentAuthorOf(request.user.id);
    return this.unitCommentService.createCommentAs(author, unitId, createUnitCommentDto);
  }

  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    WorkspaceGuard,
    UnitInWorkspaceGuard,
    CommentWriteGuard,
    CommentAccessGuard,
    CommentInUnitGuard
  )
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update comment.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Patch(':comment_id/items')
  @UseGuards(
    JwtAuthGuard,
    WorkspaceGuard,
    UnitInWorkspaceGuard,
    CommentAccessGuard,
    CommentWriteGuard,
    CommentInUnitGuard
  )
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Comment item connections for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment item connections not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update comment item connections.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  async patchCommentItems(@Param('comment_id', ParseIntPipe) commentId: number,
    @UnitId() unitId: number,
    @Body() comment: UpdateUnitCommentUnitItemsDto) {
    return this.itemCommentService.updateCommentItems(unitId, commentId, comment.unitItemUuids);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentDeleteGuard, CommentInUnitGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to delete comment.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  @ApiTags('workspace unit comment')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }

  @Patch(':comment_id/hidden')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentAccessGuard, CommentInUnitGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('review unit comment')
  async patchCommentVisibility(@Param('comment_id', ParseIntPipe) id: number,
    @Body() comment: UpdateUnitCommentVisibilityDto) {
    return this.unitCommentService.patchCommentVisibility(id, comment);
  }

  @Post(':comment_id/vote')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentAccessGuard, CommentInUnitGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Comment vote toggled.' })
  @ApiTags('workspace unit comment')
  async toggleVote(
    @Req() request,
    @Param('comment_id', ParseIntPipe) commentId: number,
    @Body() body: UnitCommentVoteDto
  ): Promise<void> {
    return this.unitCommentService.toggleVote(commentId, request.user.id, body.vote);
  }

  @Get(':comment_id/votes')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, UnitInWorkspaceGuard, CommentAccessGuard, CommentInUnitGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'workspace_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Get comment voters.', type: [UnitCommentVoterDto] })
  @ApiTags('workspace unit comment')
  async getCommentVoters(@Param('comment_id', ParseIntPipe) commentId: number): Promise<UnitCommentVoterDto[]> {
    return this.unitCommentService.getCommentVoters(commentId);
  }
}
