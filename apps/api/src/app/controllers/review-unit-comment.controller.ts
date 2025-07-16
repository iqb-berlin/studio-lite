import {
  Body,
  Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards
} from '@nestjs/common';
import {
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiParam,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import {
  CreateUnitCommentDto, UnitCommentDto, UpdateUnitCommentDto, UpdateUnitCommentUnitItemsDto
} from '@studio-lite-lib/api-dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UnitCommentService } from '../services/unit-comment.service';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { CommentAccessGuard } from '../guards/comment-access.guard';
import { CommentWriteGuard } from '../guards/comment-write.guard';
import { UnitId } from '../decorators/unit-id.decorator';
import { ItemCommentService } from '../services/item-comment.service';

@Controller('reviews/:review_id/units')
export class ReviewUnitCommentController {
  constructor(
    private unitCommentService: UnitCommentService,
    private itemCommentService: ItemCommentService
  ) {}

  @Get(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comments for unit retrieved successfully.' })
  @ApiUnauthorizedResponse({ description: 'No privileges to retrieve comments for the unit.' })
  @ApiTags('review unit comment')
  async findOnesComments(@Param('id', ParseIntPipe) unitId: number): Promise<UnitCommentDto[]> {
    return this.unitCommentService.findOnesComments(unitId);
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Sends back the id of the new comment in database',
    type: Number
  })
  @ApiUnauthorizedResponse({ description: 'No privileges to post comment for the unit.' })
  @ApiTags('review unit comment')
  async createComment(@Body() createUnitCommentDto: CreateUnitCommentDto) {
    return this.unitCommentService.createComment(createUnitCommentDto);
  }

  @Patch(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment body for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiTags('review unit comment')
  async patchCommentBody(@Param('id', ParseIntPipe) id: number, @Body() comment: UpdateUnitCommentDto) {
    return this.unitCommentService.patchCommentBody(id, comment);
  }

  @Delete(':unit_id/comments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Comment successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete comment.' })
  @ApiTags('review unit comment')
  async removeComment(@Param('id', ParseIntPipe) id: number) {
    return this.unitCommentService.removeComment(id);
  }

  @Patch(':unit_id/comments/:comment_id/items')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, CommentAccessGuard, CommentWriteGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'review_id', type: Number })
  @ApiParam({ name: 'unit_id', type: Number })
  @ApiParam({ name: 'comment_id', type: Number })
  @ApiOkResponse({ description: 'Comment item connections for successfully updated.' })
  @ApiNotFoundResponse({ description: 'Comment not found.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update comment.' })
  @ApiInternalServerErrorResponse({ description: 'Internal error. ' })
  async patchCommentItems(@Param('comment_id', ParseIntPipe) commentId: number,
    @UnitId() unitId: number,
    @Body() comment: UpdateUnitCommentUnitItemsDto) {
    return this.itemCommentService.updateCommentItems(unitId, commentId, comment.unitItemUuids);
  }
}
