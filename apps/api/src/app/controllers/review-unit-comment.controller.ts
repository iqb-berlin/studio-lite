import {
  Body,
  Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards, Req
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiParam,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import {
  CreateUnitCommentDto, UnitCommentDto, UpdateUnitCommentDto, UpdateUnitCommentUnitItemsDto,
  UpdateUnitCommentVisibilityDto, UnitCommentVoteDto, UnitCommentVoterDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ReviewGuard } from '../guards/review.guard';
import { ReviewCommentAccessGuard } from '../guards/review-comment-access.guard';
import { ReviewConfigGuard } from '../guards/review-config.guard';
import { ReviewAccountGuard } from '../guards/review-account.guard';
import { ReviewCommentOwnerGuard } from '../guards/review-comment-owner.guard';
import { CommentWriteGuard } from '../guards/comment-write.guard';
import { CommentDeleteGuard } from '../guards/comment-delete.guard';
import { CommentInUnitGuard } from '../guards/comment-in-unit.guard';
import { ReviewConfigRequired } from '../decorators/review-config-required.decorator';
import { UnitCommentService } from '../services/unit-comment.service';
import { UnitId } from '../decorators/unit-id.decorator';
import { ItemCommentService } from '../services/item-comment.service';
import { UsersService } from '../services/users.service';

/**
 * `reviews/:review_id/units/:unit_id/comments` -- the discussion on a unit as a reviewer conducts
 * it: writing, revising and deleting comments, tying one to single items, hiding one, and voting.
 *
 * The same ground as {@link WorkspaceUnitCommentController}, reached from a review -- with a review
 * login or as a logged-in user. {@link ReviewGuard} holds both to the review and its units, and a
 * user to the review's workspace; {@link ReviewCommentAccessGuard} then asks a user for the access
 * level commenting takes there (#1818). A review login holds no access level in any workspace.
 *
 * The review's settings decide for everyone who opens it (#1784), through {@link ReviewConfigGuard}:
 * writing takes "comments possible", reading the discussion "show the comments of others". A comment
 * named in the path has to be one of the unit's ({@link CommentInUnitGuard}). Changing it is left to
 * its author and deleting it to its author or the group's admin, as on the workspace's routes; a
 * review login has no account and does neither, nor does it hide comments ({@link ReviewAccountGuard}).
 * It may only tie its own new comment to items ({@link ReviewCommentOwnerGuard}).
 */
@Controller('reviews/:review_id/units/:unit_id/comments')
export class ReviewUnitCommentController {
  constructor(
    private unitCommentService: UnitCommentService,
    private itemCommentService: ItemCommentService,
    private usersService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard, ReviewConfigGuard)
  @ReviewConfigRequired('showOthersComments')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges to retrieve comments for the unit.' })
  @ApiTags('review unit comment')
  async findOnesComments(@Req() request, @Param('unit_id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId, request.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard, ReviewConfigGuard)
  @ReviewConfigRequired('canComment')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiForbiddenResponse({ description: 'No privileges to post comment for the unit.' })
  @ApiTags('review unit comment')
  async createComment(
    @Req() request,
    @Param('unit_id', ParseIntPipe) unitId: number,
    @Body() createUnitCommentDto: CreateUnitCommentDto
  ) {
    // The unit is the one of the path, which ReviewGuard has held to the review, and the author the
    // token's user (#1776) -- for a review link no one, signed with the name its visitor typed.
    const author = await this.usersService.commentAuthorOf(request.user.id, createUnitCommentDto.userName);
    return this.unitCommentService.createCommentAs(author, unitId, createUnitCommentDto);
  }

  @Patch(':comment_id')
  @UseGuards(
    JwtAuthGuard,
    ReviewGuard,
    ReviewCommentAccessGuard,
    ReviewConfigGuard,
    CommentWriteGuard,
    CommentInUnitGuard
  )
  @ReviewConfigRequired('canComment')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('review unit comment')
  async patchCommentBody(@Param('comment_id', ParseIntPipe) id: number,
    @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Patch(':comment_id/hidden')
  @UseGuards(
    JwtAuthGuard,
    ReviewGuard,
    ReviewAccountGuard,
    ReviewCommentAccessGuard,
    ReviewConfigGuard,
    CommentInUnitGuard
  )
  @ReviewConfigRequired('canComment')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('review unit comment')
  async patchCommentVisibility(@Param('comment_id', ParseIntPipe) id: number,
    @Body() comment: UpdateUnitCommentVisibilityDto) {
    return this.unitCommentService.patchCommentVisibility(id, comment);
  }

  @Delete(':comment_id')
  @UseGuards(
    JwtAuthGuard,
    ReviewGuard,
    ReviewCommentAccessGuard,
    ReviewConfigGuard,
    CommentDeleteGuard,
    CommentInUnitGuard
  )
  @ReviewConfigRequired('canComment')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('review unit comment')
  async removeComment(@Param('comment_id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }

  @Patch(':comment_id/items')
  @UseGuards(
    JwtAuthGuard,
    ReviewGuard,
    ReviewCommentAccessGuard,
    ReviewConfigGuard,
    ReviewCommentOwnerGuard,
    CommentInUnitGuard
  )
  @ReviewConfigRequired('canComment')
  @ApiBearerAuth()
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Comment item connections for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to update comment.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  async patchCommentItems(@Param('comment_id', ParseIntPipe) commentId: number,
    @UnitId() unitId: number,
    @Body() comment: UpdateUnitCommentUnitItemsDto) {
    return this.itemCommentService.updateCommentItems(unitId, commentId, comment.unitItemUuids);
  }

  @Post(':comment_id/vote')
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard, ReviewConfigGuard, CommentInUnitGuard)
  @ReviewConfigRequired('canComment', 'showOthersComments')
  @ApiBearerAuth()
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Comment vote toggled.' })
  @ApiForbiddenResponse({ description: 'A review opened through its link and password has no account to vote with.' })
  @ApiTags('review unit comment')
  async toggleVote(
    @Req() request,
    @Param('comment_id', ParseIntPipe) commentId: number,
    @Body() body: UnitCommentVoteDto
  ): Promise<void> {
    return this.unitCommentService.toggleVote(commentId, request.user.id, body.vote);
  }

  @Get(':comment_id/votes')
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard, ReviewConfigGuard, CommentInUnitGuard)
  @ReviewConfigRequired('showOthersComments')
  @ApiBearerAuth()
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Get comment voters.', type: [UnitCommentVoterDto] })
  @ApiTags('review unit comment')
  async getCommentVoters(@Param('comment_id', ParseIntPipe) commentId: number): Promise<UnitCommentVoterDto[]> {
    return this.unitCommentService.getCommentVoters(commentId);
  }
}
