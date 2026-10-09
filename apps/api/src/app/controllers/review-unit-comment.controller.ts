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
 */
@Controller('reviews/:review_id/units/:unit_id/comments')
export class ReviewUnitCommentController {
  constructor(
    private unitCommentService: UnitCommentService,
    private itemCommentService: ItemCommentService,
    private usersService: UsersService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiForbiddenResponse({ description: 'No privileges to retrieve comments for the unit.' })
  @ApiTags('review unit comment')
  async findOnesComments(@Req() request, @Param('unit_id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId, request.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
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
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
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
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
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
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiForbiddenResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('review unit comment')
  async removeComment(@Param('comment_id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }

  @Patch(':comment_id/items')
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
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
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
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
  @UseGuards(JwtAuthGuard, ReviewGuard, ReviewCommentAccessGuard)
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
